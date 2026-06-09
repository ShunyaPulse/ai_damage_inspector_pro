import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { description, base64Image, mimeType } = await req.json();

        // Securely parse multiple keys from the environment into an array
        const apiKeys = (process.env.GEMINI_API_KEY || '')
            .split(',')
            .map(key => key.trim())
            .filter(Boolean);

        if (apiKeys.length === 0) {
            return NextResponse.json(
                { error: "API keys are not configured securely on the server." },
                { status: 500 }
            );
        }

        const promptText = `
      You are an expert Insurance Adjuster and Property Damage Assessor in India. 
      Analyze the user's description and the uploaded photo.
      Output ONLY a valid JSON object with the following keys, and nothing else. Do not use markdown tags like \`\`\`json.
      {
          "damageType": "Short 3-5 word description",
          "severity": "Low, Medium, High, or Critical",
          "estimatedCostINR": "Realistic price range in ₹, e.g., ₹15,000 - ₹25,000",
          "summary": "A 3-sentence professional summary of the damage and recommended action."
      }
      User Description: ${description}
    `;

        const requestBody = {
            contents: [{
                parts: [
                    { text: promptText },
                    { inline_data: { mime_type: mimeType, data: base64Image } }
                ]
            }],
            generationConfig: { temperature: 0.2 }
        };

        // Graceful Failover Loop
        for (let i = 0; i < apiKeys.length; i++) {
            const currentKey = apiKeys[i];

            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${currentKey}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const status = response.status;
                // If Rate Limited or Forbidden, cycle to the next key
                if (status === 429 || status === 403) {
                    console.warn(`Key at index ${i} failed with status ${status}. Cycling to next key...`);
                    continue;
                } else {
                    const errData = await response.json();
                    return NextResponse.json({ error: errData.error?.message || "AI Request Failed" }, { status });
                }
            }

            const data = await response.json();
            let aiText = data.candidates[0].content.parts[0].text.trim();

            // Clean potential markdown tags
            if (aiText.startsWith("```json")) aiText = aiText.substring(7);
            if (aiText.endsWith("```")) aiText = aiText.substring(0, aiText.length - 3);

            return NextResponse.json(JSON.parse(aiText));
        }

        // If the loop completes without a return, all keys are exhausted
        return NextResponse.json(
            { error: "All provided API keys exhausted their quotas or failed." },
            { status: 429 }
        );

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}