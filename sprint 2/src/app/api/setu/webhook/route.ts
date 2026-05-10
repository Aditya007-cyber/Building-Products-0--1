import { NextResponse } from 'next/server'

// Mock endpoint simulating Setu Account Aggregator webhook
export async function POST(request: Request) {
  try {
    const payload = await request.json()

    // Simulate standard mock response
    return NextResponse.json({
      success: true,
      message: "FI Data received and processed successfully",
      data: payload
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
