const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

async function testPdf() {
    try {
        console.log('1. Creating a new Financial Report...');
        
        // Use JSON for simplicity instead of FormData
        const reportData = {
            month: 2,
            year: 2026,
            totalIncome: 1500000,
            totalExpense: 300000,
            description: 'Test for PDF generation'
        };

        const createRes = await fetch('http://localhost:5000/api/financial-reports', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reportData)
        });
        
        const createJson = await createRes.json();
        
        if (!createJson.success && createJson.message.includes('already exists')) {
            console.log('Report already exists, skipping creation for this test (or delete it first).');
            return;
        }

        const reportId = createJson.data.id;
        console.log('Created report ID:', reportId);

        console.log('2. Adding transactions...');
        await fetch('http://localhost:5000/api/financial-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId,
                date: new Date().toISOString(),
                amount: 1500000,
                receiverSender: 'Resident Payments',
                description: 'Monthly Fee Collection',
                type: 'INCOME'
            })
        });

        await fetch('http://localhost:5000/api/financial-transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                reportId,
                date: new Date().toISOString(),
                amount: 300000,
                receiverSender: 'Plumbing Service',
                description: 'Pipe repair in basement',
                type: 'EXPENSE'
            })
        });
        console.log('Transactions added.');

        console.log('3. Downloading PDF...');
        const pdfRes = await fetch(`http://localhost:5000/api/financial-reports/${reportId}/pdf`);
        
        const fileStream = fs.createWriteStream('./test-report.pdf');
        await finished(Readable.fromWeb(pdfRes.body).pipe(fileStream));
        
        console.log('PDF downloaded successfully to test-report.pdf');
    } catch (e) {
        console.error('Error during test:', e);
    }
}

testPdf();
