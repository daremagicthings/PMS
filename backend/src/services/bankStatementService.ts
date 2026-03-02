import prisma from '../lib/prisma';
import * as xlsx from 'xlsx';
import { BankStatement, Invoice } from '@prisma/client';

export const uploadBankStatements = async (filePath: string) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

    let successCount = 0;
    let errorCount = 0;
    const errors: { row: number; reason: string }[] = [];

    const toInsert = [];

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const { Date: rowDate, Amount, Description } = row;
        const rowNum = i + 2;

        try {
            if (!rowDate || Amount === undefined || !Description) {
                throw new Error('Missing required fields: Date, Amount, Description');
            }

            let parsedDate: Date;
            if (typeof rowDate === 'number') {
                parsedDate = new Date(Math.round((rowDate - 25569) * 86400 * 1000));
            } else {
                parsedDate = new Date(rowDate);
            }

            if (isNaN(parsedDate.getTime())) {
                throw new Error(`Invalid date format`);
            }

            toInsert.push({
                date: parsedDate,
                amount: Number(Amount),
                description: String(Description),
                status: 'PENDING'
            });

        } catch (err: any) {
            errorCount++;
            errors.push({ row: rowNum, reason: err.message });
        }
    }

    if (toInsert.length > 0) {
        await prisma.bankStatement.createMany({
            data: toInsert
        });
        successCount = toInsert.length;
    }

    return { successCount, errorCount, errors };
};

export const getPendingBankStatements = async (): Promise<BankStatement[]> => {
    return await prisma.bankStatement.findMany({
        where: { status: 'PENDING' },
        orderBy: { date: 'desc' },
    });
};

export const autoMatchStatements = async () => {
    const pendingStatements = await prisma.bankStatement.findMany({
        where: { status: 'PENDING' },
    });

    const pendingInvoices = await prisma.invoice.findMany({
        where: { status: 'PENDING' },
        include: { apartment: true },
    });

    let matchedCount = 0;

    for (const statement of pendingStatements) {
        // Filter invoices by exact amount match first
        let potentialInvoices = pendingInvoices.filter(inv => inv.amount === statement.amount);
        
        // Regex to find things like "35-12" or "35 12"
        const bldgUnitMatch = statement.description.match(/(\d+)[-\s](\d+)/);
        
        if (bldgUnitMatch) {
            const bldg = bldgUnitMatch[1];
            const unit = bldgUnitMatch[2];
            
            const exactAptMatch = potentialInvoices.find(inv => 
                (inv.apartment.buildingName.includes(bldg) || inv.apartment.buildingName === bldg) && 
                inv.apartment.unitNumber === unit
            );
            
            if (exactAptMatch) {
                potentialInvoices = [exactAptMatch];
            } else {
                // fallback to just checking unit number
                const unitMatch = statement.description.match(/\b(\d+)\b/);
                if (unitMatch) {
                    const u = unitMatch[1];
                    const invByUnit = potentialInvoices.filter(inv => inv.apartment.unitNumber === u);
                    if (invByUnit.length === 1) potentialInvoices = invByUnit;
                }
            }
        } else {
            // No dash format, try just finding a standalone number representing the unit
            const unitMatch = statement.description.match(/\b(\d+)\b/);
            if (unitMatch) {
                const u = unitMatch[1];
                const invByUnit = potentialInvoices.filter(inv => inv.apartment.unitNumber === u);
                if (invByUnit.length === 1) potentialInvoices = invByUnit;
            }
        }

        // Only auto-match if exactly ONE invoice perfectly matches
        if (potentialInvoices.length === 1) {
            const invoiceToMatch = potentialInvoices[0];

            await prisma.$transaction([
                prisma.bankStatement.update({
                    where: { id: statement.id },
                    data: { status: 'MATCHED', matchedInvoiceId: invoiceToMatch.id },
                }),
                prisma.invoice.update({
                    where: { id: invoiceToMatch.id },
                    data: { status: 'PAID', paidAt: new Date() },
                }),
            ]);
            matchedCount++;
            
            // Remove matched invoice from memory pool to prevent double matching
            const idx = pendingInvoices.findIndex(i => i.id === invoiceToMatch.id);
            if (idx > -1) pendingInvoices.splice(idx, 1);
        }
    }

    return { matchedCount };
};

export const manualMatchStatement = async (statementId: string, invoiceId: string) => {
    const statement = await prisma.bankStatement.findUnique({ where: { id: statementId } });
    if (!statement || statement.status === 'MATCHED') throw new Error('Invalid or already matched bank statement');

    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });
    if (!invoice || invoice.status !== 'PENDING') throw new Error('Invalid or non-pending invoice');

    await prisma.$transaction([
        prisma.bankStatement.update({
            where: { id: statementId },
            data: { status: 'MATCHED', matchedInvoiceId: invoiceId },
        }),
        prisma.invoice.update({
            where: { id: invoiceId },
            data: { status: 'PAID', paidAt: new Date() },
        }),
    ]);

    return { success: true };
};
