import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `You are KharchaBook, an AI financial analyst. You will receive an array of banking transactions. 
Your job is to:
1. Categorize the transactions into 5-6 broad spending categories (e.g., Food, Travel, Utilities, Shopping, Salary). Assign a hex color to each category.
2. Generate a personalized, multi-paragraph "Financial Story" highlighting spending spikes, recurring patterns, and overall observations.
3. Provide 3 dynamic highlights mapped to UI icons (valid icons: 'AlertCircle', 'ShoppingBag', 'TrendingUp', 'TrendingDown', 'Coffee').

Output MUST be strictly in the following JSON format:
{
  "categories": [
    { "name": "string", "color": "hex", "total": "number" }
  ],
  "story": "string (multiline paragraph with formatting)",
  "highlights": [
    { "title": "string", "description": "string", "icon": "string" }
  ],
  "categorizedTransactions": [
    { "description": "string", "amount": "number", "type": "debit|credit", "category": "string" }
  ]
}
Ensure the 'categorizedTransactions' list maps the input transactions to the assigned categories.
`

export async function POST(request: Request) {
  try {
    const { transactions } = await request.json()

    if (!transactions || !Array.isArray(transactions)) {
      return NextResponse.json({ error: 'Invalid transactions data' }, { status: 400 })
    }

    // Limit to top 50 to avoid token limits
    const top50 = transactions.slice(0, 50)

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: JSON.stringify(top50) }
        ],
        response_format: { type: 'json_object' }
      })

      const insights = JSON.parse(completion.choices[0].message.content!)
      return NextResponse.json(insights)
    } catch (openAiError) {
      console.error("OpenAI failed, falling back gracefully", openAiError)
      // Graceful Degradation (Fallback)
      return NextResponse.json(getFallbackInsights(top50))
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

function getFallbackInsights(transactions: any[]) {
  // Compute some basic totals locally if OpenAI fails
  let totalDebit = 0
  let totalCredit = 0
  transactions.forEach(tx => {
    if (tx.type === 'debit') totalDebit += tx.amount
    else totalCredit += tx.amount
  })

  return {
    categories: [
      { name: "General Spending", color: "#f87171", total: totalDebit },
      { name: "Income", color: "#4ade80", total: totalCredit }
    ],
    story: "We couldn't generate your AI financial story right now, but your data is safe. Here is a simplified breakdown of your recent activity.",
    highlights: [
      { title: "AI Unavailable", description: "Fell back to local processing.", icon: "AlertCircle" }
    ],
    categorizedTransactions: transactions.map(tx => ({ ...tx, category: tx.type === 'debit' ? 'General Spending' : 'Income' }))
  }
}
