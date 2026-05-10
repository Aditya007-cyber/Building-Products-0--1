import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
    let transactions = [];
    try {
        const payload = await request.json();
        transactions = payload.transactions;

        if (!transactions || !Array.isArray(transactions)) {
            return NextResponse.json({ error: 'Invalid transactions payload' }, { status: 400 });
        }

        // We only process the last month's data for the narrative to save tokens.
        // In a real application, you'd calculate the date ranges dynamically.
        // For this prototype, we'll just send the top 50 transactions to the LLM to prevent huge context windows.
        const recentTxns = transactions.slice(0, 50).map(t => ({
            date: t.date,
            merchant: t.merchant,
            amount: t.amount,
            type: t.type
        }));

        const systemPrompt = `
You are KharchaBook, an intelligent financial AI. Your job is to analyze the user's recent transactions and return a JSON payload with categorized expenses and a personalized, empathetic financial narrative.
You must return VALID JSON ONLY. No markdown wrapping.

The JSON schema must be exactly:
{
    "categories": [
        { "name": "Category Name", "value": 1200, "color": "#hexcode" }
    ],
    "story": {
        "month": "Month Year (e.g., April 2026)",
        "text": [
            "Paragraph 1 of narrative.",
            "Paragraph 2 of narrative.",
            "Paragraph 3 highlighting something interesting."
        ],
        "highlights": [
            { "icon": "AlertCircle", "label": "Short label", "value": "Metric value" }
        ]
    }
}

Guidelines for categories: Group similar expenses into 5-6 broad categories (e.g., Food & Dining, Shopping, Travel, Subscriptions, Other). Assign a distinct color hex for each.
Guidelines for the story: 
- Be conversational and direct, like a smart financial advisor.
- Highlight major spending spikes.
- Identify recurring patterns (like consistent food delivery).
- Point out unused or large subscriptions if you see them.
- Ensure the tone is "Fintech Serious" but human.
- Allowed highlight icons: "Plane", "Utensils", "Moon", "AlertCircle", "ShoppingBag"
`;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // Cost effective model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here are the transactions:\n${JSON.stringify(recentTxns, null, 2)}` }
            ],
            temperature: 0.7,
            response_format: { type: "json_object" }
        });

        const content = response.choices[0].message.content;
        const insights = JSON.parse(content);

        return NextResponse.json({ success: true, insights });

    } catch (error) {
        console.error('Insights API Error:', error);
        
        // --- FALLBACK LOGIC ---
        // If OpenAI fails (e.g. insufficient quota, rate limit), return a graceful fallback 
        // instead of crashing the UI so the user can still test the prototype.
        const fallbackInsights = {
            categories: [
                { name: 'General/Uncategorized', value: transactions.reduce((sum, t) => sum + (t.type === 'debit' ? t.amount : 0), 0), color: '#6b7280' },
                { name: 'Estimated Food', value: 3100, color: '#e11d48' }
            ],
            story: {
                month: "Current Month",
                text: [
                    "We processed your transactions successfully!",
                    "However, our AI Intelligence engine is currently unavailable (API Quota Exceeded).",
                    "We've grouped your spending into a general category for now. Please update your API key billing to see the full narrative."
                ],
                highlights: [
                    { icon: "AlertCircle", label: "AI Offline", value: "Using fallback mode" }
                ]
            }
        };

        return NextResponse.json({ success: true, insights: fallbackInsights });
    }
}
