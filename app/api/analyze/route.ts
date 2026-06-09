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
      Output ONLY a valid JSON object with the following keys, and nothing else. Do not use markdown tags like \`\`\`json.
      {
          "damageType": "Short 3-5 word description",
          "severity": "Low, Medium, High, or Critical",
          "estimatedCostINR": "Realistic price range in ₹, e.g., ₹15,000 - ₹25,000",
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