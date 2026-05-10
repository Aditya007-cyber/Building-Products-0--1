import { NextResponse } from 'next/server';
import Papa from 'papaparse';

export async function POST(request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const text = await file.text();
        
        // Parse CSV using PapaParse
        const parsed = Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
        });

        if (parsed.errors.length > 0) {
            console.error('CSV Parsing Errors:', parsed.errors);
            return NextResponse.json({ error: 'Failed to parse CSV', details: parsed.errors }, { status: 400 });
        }

        // Basic normalization: Convert varying headers to a standard format
        // Expected standard: date, description, amount, type (credit/debit)
        const rawTransactions = parsed.data.map((row, index) => {
            // Very naive mapping - in a real app, you'd have mapping templates per bank
            const keys = Object.keys(row);
            const dateStr = row.Date || row.date || row['Transaction Date'] || keys.find(k => k.toLowerCase().includes('date'));
            const desc = row.Description || row.description || row.Narration || row.Remarks || keys.find(k => k.toLowerCase().includes('description') || k.toLowerCase().includes('narration'));
            
            // Amount handling (some banks have separate Debit/Credit columns)
            let amount = row.Amount || row.amount;
            let type = 'debit';
            
            if (amount === undefined) {
                const debit = row.Debit || row.Withdrawal || row['Withdrawal Amount (INR )'];
                const credit = row.Credit || row.Deposit || row['Deposit Amount (INR )'];
                
                if (debit) {
                    amount = typeof debit === 'string' ? parseFloat(debit.replace(/,/g, '')) : debit;
                    type = 'debit';
                } else if (credit) {
                    amount = typeof credit === 'string' ? parseFloat(credit.replace(/,/g, '')) : credit;
                    type = 'credit';
                }
            } else {
                // If single amount column, usually negative means debit, or there's a type column
                if (typeof amount === 'string') amount = parseFloat(amount.replace(/,/g, ''));
                if (amount < 0) {
                    amount = Math.abs(amount);
                    type = 'debit';
                }
            }

            return {
                id: `txn_${index}`,
                date: row[dateStr] || new Date().toISOString().split('T')[0],
                merchant: row[desc] ? String(row[desc]).substring(0, 50) : 'Unknown Transaction',
                amount: amount || 0,
                type: type,
                raw: row // Keep raw data just in case
            };
        });

        // We filter out zero amount transactions
        const validTransactions = rawTransactions.filter(t => t.amount > 0);

        return NextResponse.json({ 
            success: true, 
            count: validTransactions.length,
            transactions: validTransactions
        });

    } catch (error) {
        console.error('Upload API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
