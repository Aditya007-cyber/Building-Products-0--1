import { NextResponse } from 'next/server';

// Mock Setu Webhook to simulate receiving FI Data
export async function POST(request) {
    try {
        const payload = await request.json();

        // Validate basic Setu FI Data Notification shape
        if (!payload.FIStatusNotification || !payload.FIStatusNotification.sessionStatus) {
            return NextResponse.json({ error: 'Invalid Setu payload' }, { status: 400 });
        }

        const { sessionStatus, consentId } = payload.FIStatusNotification;

        if (sessionStatus !== 'COMPLETED') {
            return NextResponse.json({ message: 'Session not completed yet' }, { status: 200 });
        }

        // In a real application:
        // 1. You would now use the consentId to fetch the encrypted FI Data from Setu FIU APIs
        // 2. Decrypt the data using your private key and the JWE header
        // 3. Process the XML/JSON bank data into your DB

        // Here we simulate the decrypted output for "Rohan Mehta"
        const mockDecryptedTransactions = [
            { id: 'setu_1', date: '2026-04-28', merchant: 'UPI-SWIGGY-12345', amount: 340, type: 'debit', account: 'HDFC Credit Card' },
            { id: 'setu_2', date: '2026-04-27', merchant: 'POS INDIGO AIRLINES', amount: 6200, type: 'debit', account: 'SBI Savings' },
            { id: 'setu_3', date: '2026-04-26', merchant: 'NEFT SALARY ACME CORP', amount: 120000, type: 'credit', account: 'SBI Savings' },
            { id: 'setu_4', date: '2026-04-25', merchant: 'AMAZON PAY INDIA', amount: 1899, type: 'debit', account: 'HDFC Credit Card' },
            { id: 'setu_5', date: '2026-04-22', merchant: 'UPI-ZOMATO-9876', amount: 480, type: 'debit', account: 'Paytm Wallet' },
            { id: 'setu_6', date: '2026-04-20', merchant: 'NETFLIX ENTERTAINMENT', amount: 649, type: 'debit', account: 'HDFC Credit Card' }
        ];

        console.log(`[Setu Webhook] Processed mock FI data for Consent: ${consentId}`);

        // Acknowledge webhook success to Setu
        return NextResponse.json({ 
            success: true, 
            message: 'Data successfully ingested',
            // We normally don't return the decrypted data to Setu, 
            // but for frontend testing, we'll echo it back.
            debug_mock_data: mockDecryptedTransactions 
        });

    } catch (error) {
        console.error('Setu Webhook Error:', error);
        return NextResponse.json({ error: 'Internal server error processing webhook' }, { status: 500 });
    }
}
