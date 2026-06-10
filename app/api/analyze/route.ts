import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        // 1. Extract the new 'images' array instead of base64Image
        const { description, images } = await req.json();

        const apiKeys = (process.env.GEMINI_API_KEY || '')
            .split(',')
            .map(key => key.trim())
            .filter(Boolean);

        if (apiKeys.length === 0) {
            return NextResponse.json({ error: "API keys are not configured." }, { status: 500 });
        }

        const promptText = `
      You are an expert Insurance Adjuster and Property Damage Assessor in India. 
      Analyze the user's description and all uploaded photos.
      
      CRITICAL INSTRUCTIONS FOR COST ESTIMATION (INDIA SPECIFIC):
      - VEHICLES: Assume standard mass-market Indian cars (e.g., Maruti, Hyundai, Tata) unless a luxury badge is explicitly visible.
        * Standard body panel parts (doors, bumpers, fenders) usually cost between ₹3,000 to ₹10,000.
        * Local garage denting/painting labor per panel is typically ₹2,500 to ₹6,000.
        * Total replacement and painting of a single standard door should rarely exceed ₹15,000 to ₹25,000.
      - PROPERTY: Assume standard Indian residential construction (Brickwork, RCC, cement plaster, standard tiles/roofing).
        * Use local Indian material costs and standard daily wage labor rates (e.g., masonry work, basic plumbing).
        * Do NOT quote Western construction costs (like drywall or timber framing) or high-end architectural materials unless explicitly visible.
        * Minor wall/plaster repairs usually range from ₹2,000 to ₹10,000. Major structural/roof damage can range from ₹20,000 to ₹1,00,000+ depending on square footage.

      Output ONLY a valid JSON object with the following keys, and nothing else. Do not use markdown tags like \`\`\`json.
      {
          "damageType": "Short 3-5 word description",
          "severity": "Low, Medium, High, or Critical",
          "estimatedCostINR": "Realistic TOTAL price range in ₹",
          "costBreakdown": [
             { "item": "e.g., Parts/Material", "cost": "₹ amount" },
             { "item": "e.g., Labor/Repair", "cost": "₹ amount" },
             { "item": "e.g., Taxes/Misc", "cost": "₹ amount" }
          ],
          "summary": "A 3-sentence professional summary of the overall damage and recommended action."
      }
      User Description: ${description}
    `;
        // 2. Map through the frontend images to create Gemini's inlineData parts
        // (Using inlineData and mimeType as the strict standard)
        const imageParts = images.map((img: any) => ({
            inlineData: { mimeType: img.mimeType, data: img.data }
        }));

        // 3. Inject the text prompt AND all image parts into the payload
        const requestBody = {
            contents: [{
                parts: [
                    { text: promptText },
                    ...imageParts
                ]
            }],
            generationConfig: { temperature: 0.2 }
        };

        // Graceful Failover Loop remains the same...
        for (let i = 0; i < apiKeys.length; i++) {
            const currentKey = apiKeys[i];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const status = response.status;
                if (status === 429 || status === 403) {
                    continue;
                } else {
                    const errData = await response.json();
                    return NextResponse.json({ error: errData.error?.message || "AI Request Failed" }, { status });
                }
            }

            const data = await response.json();
            let aiText = data.candidates[0].content.parts[0].text.trim();

            if (aiText.startsWith("```json")) aiText = aiText.substring(7);
            if (aiText.endsWith("```")) aiText = aiText.substring(0, aiText.length - 3);

            return NextResponse.json(JSON.parse(aiText));
        }

        return NextResponse.json({ error: "All provided API keys exhausted their quotas or failed." }, { status: 429 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}