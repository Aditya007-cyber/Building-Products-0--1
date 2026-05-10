import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Simulate network delay for AA consent & data fetch flow
    await new Promise(resolve => setTimeout(resolve, 2500))

    // Return mock normalized transactions (same format as CSV output)
    const mockTransactions = [
      { date: "2023-10-01", description: "Zomato Online Order", amount: 450.00, type: "debit" },
      { date: "2023-10-02", description: "Uber Rides", amount: 220.00, type: "debit" },
      { date: "2023-10-03", description: "Salary Oct 2023", amount: 85000.00, type: "credit" },
      { date: "2023-10-05", description: "Amazon Prime Video", amount: 1499.00, type: "debit" },
      { date: "2023-10-08", description: "Swiggy Instamart", amount: 650.00, type: "debit" },
      { date: "2023-10-10", description: "Airtel Broadband", amount: 1180.00, type: "debit" },
      { date: "2023-10-12", description: "Starbucks Coffee", amount: 350.00, type: "debit" },
      { date: "2023-10-15", description: "UPI Transfer to Ramesh", amount: 2000.00, type: "debit" },
      { date: "2023-10-18", description: "Dividend Income", amount: 1500.00, type: "credit" },
      { date: "2023-10-20", description: "HDFC Credit Card Bill", amount: 12500.00, type: "debit" },
      { date: "2023-10-22", description: "Myntra Shopping", amount: 3450.00, type: "debit" },
      { date: "2023-10-25", description: "Blinkit Groceries", amount: 980.00, type: "debit" },
      { date: "2023-10-28", description: "MakeMyTrip Flights", amount: 8500.00, type: "debit" },
      { date: "2023-10-29", description: "Netflix Subscription", amount: 499.00, type: "debit" },
      { date: "2023-10-31", description: "Interest Received", amount: 320.00, type: "credit" },
    ]

    return NextResponse.json({ transactions: mockTransactions })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
