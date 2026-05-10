import { NextResponse } from 'next/server'
import Papa from 'papaparse'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const text = await file.text()
    
    return new Promise<Response>((resolve) => {
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          // Normalize the data
          const normalized = results.data.map((row: any) => {
            // Attempt to find keys regardless of case or spaces
            const keys = Object.keys(row)
            const getDate = () => keys.find(k => k.toLowerCase().includes('date'))
            const getDesc = () => keys.find(k => k.toLowerCase().includes('description') || k.toLowerCase().includes('narration') || k.toLowerCase().includes('particulars'))
            const getDebit = () => keys.find(k => k.toLowerCase().includes('debit') || k.toLowerCase().includes('withdrawal'))
            const getCredit = () => keys.find(k => k.toLowerCase().includes('credit') || k.toLowerCase().includes('deposit'))
            const getAmount = () => keys.find(k => k.toLowerCase() === 'amount')

            const dateKey = getDate()
            const descKey = getDesc()
            const debitKey = getDebit()
            const creditKey = getCredit()
            const amountKey = getAmount()

            let amount = 0
            let type = 'unknown'

            if (debitKey && row[debitKey]) {
              amount = parseFloat(row[debitKey].replace(/,/g, ''))
              type = 'debit'
            } else if (creditKey && row[creditKey]) {
              amount = parseFloat(row[creditKey].replace(/,/g, ''))
              type = 'credit'
            } else if (amountKey && row[amountKey]) {
              const val = parseFloat(row[amountKey].replace(/,/g, ''))
              amount = Math.abs(val)
              type = val < 0 ? 'debit' : 'credit' // Assumes negative is debit if it's a single column
            }

            return {
              date: dateKey ? row[dateKey] : null,
              description: descKey ? row[descKey] : 'Unknown Transaction',
              amount,
              type,
            }
          }).filter(tx => tx.amount > 0) // Filter out invalid rows

          resolve(NextResponse.json({ transactions: normalized }))
        },
        error: (error: any) => {
          resolve(NextResponse.json({ error: error.message }, { status: 500 }))
        }
      })
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
