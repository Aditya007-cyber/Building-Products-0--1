const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        const { text } = JSON.parse(event.body);

        const systemPrompt = `You are an AI stylist for Amazon. 
Your goal is to parse the user's shopping request and map it to ONE of these predefined vibes:
["beachy", "professional", "cozy", "comfort", "traditional", "loungewear", "casual"].
Also determine the targetGender if explicitly or implicitly mentioned: ["men", "women", null].
Reply strictly in JSON format:
{
    "vibe": "string",
    "targetGender": "string|null",
    "responseText": "A friendly 1-2 sentence response confirming what you are curating."
}`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: text }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(JSON.parse(data.choices[0].message.content))
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to process intent", details: error.toString() })
        };
    }
};
