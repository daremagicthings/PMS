import prisma from '../lib/prisma';
import { Invoice, InvoiceStatus } from '@prisma/client';
import * as xlsx from 'xlsx';

/** Shape of the create invoice request body */
export interface CreateInvoiceInput {
    apartmentId: string;
    amount: number;
    description?: string;
    dueDate: string; // ISO date string
}

/**
 * Creates a new invoice for a specific apartment.
 * Constitution: Financial data is sensitive — invoices default to PENDING.
 *
 * @param input - Invoice creation data
 * @returns The newly created invoice
 */
export const createInvoice = async (input: CreateInvoiceInput): Promise<Invoice> => {
    // Verify apartment exists
    const apartment = await prisma.apartment.findUnique({
        where: { id: input.apartmentId },
    });

    if (!apartment) {
        throw new Error(`Apartment with ID ${input.apartmentId} not found`);
    }

    const invoice = await prisma.invoice.create({
        data: {
            apartmentId: input.apartmentId,
            amount: input.amount,
            description: input.description || null,
            dueDate: new Date(input.dueDate),
            status: 'PENDING',
        },
    });

    return invoice;
};

export interface InvoiceFilters {
    status?: string;
    startDate?: string;
    endDate?: string;
    apartmentId?: string;
}

const buildWhereClause = (filters?: InvoiceFilters) => {
    const where: any = {};
    if (filters?.status && filters.status !== 'ALL') {
        where.status = filters.status;
    }
    if (filters?.startDate || filters?.endDate) {
        where.dueDate = {};
        if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
        if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
    }
    if (filters?.apartmentId) {
        where.apartmentId = filters.apartmentId;
    }
    return where;
};

/**
 * Retrieves all invoices with their linked apartment data.
 *
 * @returns Array of invoices with apartment info
 */
export const getAllInvoices = async (filters?: InvoiceFilters): Promise<Invoice[]> => {
    const invoices = await prisma.invoice.findMany({
        where: buildWhereClause(filters),
        include: {
            apartment: {
                select: {
                    id: true,
                    buildingName: true,
                    unitNumber: true,
                    entrance: true,
                    floor: true,
                    residents: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return invoices;
};

/**
 * Retrieves invoices visible to a specific resident.
 * Dual visibility: shows invoices where the resident is either the
 * ownerId OR the tenantId of the linked apartment.
 * Constitution: Residents can only see their own financial data.
 */
export const getInvoicesForResident = async (userId: string, filters?: InvoiceFilters): Promise<Invoice[]> => {
    const baseWhere = buildWhereClause(filters);
    const invoices = await prisma.invoice.findMany({
        where: {
            ...baseWhere,
            apartment: {
                OR: [
                    { ownerId: userId },
                    { tenantId: userId },
                    { residents: { some: { id: userId } } },
                ],
            },
        },
        include: {
            apartment: {
                select: {
                    id: true,
                    buildingName: true,
                    unitNumber: true,
                    entrance: true,
                    floor: true,
                    residents: {
                        select: {
                            name: true,
                            phone: true,
                        },
                    },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return invoices;
};

/**
 * Calculates and applies penalties to all overdue PENDING invoices.
 * Adds a flat 5000 MNT penalty to each.
 * Constitution: Penalties must be transparent — logged and visible to residents.
 *
 * @returns Number of invoices penalized
 */
export const calculatePenalties = async (): Promise<{ penalizedCount: number }> => {
    const now = new Date();
    const overdueInvoices = await prisma.invoice.findMany({
        where: {
            status: 'PENDING',
            dueDate: { lt: now },
        },
    });

    const FLAT_PENALTY = 5000; // 5000 MNT

    let penalizedCount = 0;
    for (const inv of overdueInvoices) {
        await prisma.invoice.update({
            where: { id: inv.id },
            data: {
                penaltyAmount: inv.penaltyAmount + FLAT_PENALTY,
            },
        });
        penalizedCount++;
    }

    return { penalizedCount };
};

/**
 * Marks an invoice as PAID with the current timestamp.
 * Constitution: Never hard-delete a paid invoice — use status flags instead.
 *
 * @param invoiceId - UUID of the invoice to mark as paid
 * @returns The updated invoice
 * @throws Error if invoice not found or already paid/cancelled
 */
export const markInvoiceAsPaid = async (invoiceId: string): Promise<Invoice> => {
    const existing = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!existing) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    if (existing.status === InvoiceStatus.PAID) {
        throw new Error('Invoice is already marked as paid');
    }

    if (existing.status === InvoiceStatus.CANCELLED) {
        throw new Error('Cannot pay a cancelled invoice');
    }

    const updated = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            status: 'PAID',
            paidAt: new Date(),
        },
    });

    return updated;
};

/**
 * Parses an Excel file and bulk imports invoices.
 * @param filePath Path to the uploaded Excel file
 * @returns Summary of successful and failed imports
 */
export const bulkImportInvoices = async (filePath: string) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]) as any[];

    let successCount = 0;
    let errorCount = 0;
    const errors: { row: number; reason: string }[] = [];

    type ProcessedInvoice = {
        apartmentId: string;
        amount: number;
        description: string | null;
        dueDate: Date;
        status: InvoiceStatus;
    };

    const toInsert: ProcessedInvoice[] = [];

    // Pre-fetch all apartments for faster lookup
    const apartments = await prisma.apartment.findMany({
        select: { id: true, buildingName: true, entrance: true, unitNumber: true }
    });

    const aptMap = new Map<string, string>();
    for (const apt of apartments) {
        const key = `${apt.buildingName}-${apt.entrance}-${apt.unitNumber}`;
        aptMap.set(key, apt.id);
    }

    for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const { buildingName, entrance, unitNumber, amount, description, dueDate } = row;
        const rowNum = i + 2; // Assuming 1-based index and 1 header row

        try {
            if (!buildingName || !entrance || !unitNumber || amount === undefined || !dueDate) {
                throw new Error('Missing required fields');
            }

            const key = `${buildingName}-${entrance}-${unitNumber}`;
            const apartmentId = aptMap.get(key);

            if (!apartmentId) {
                throw new Error(`Apartment not found`);
            }

            // Handle dueDate
            let parsedDueDate: Date;
            if (typeof dueDate === 'number') {
                // Excel serial date formula
                parsedDueDate = new Date(Math.round((dueDate - 25569) * 86400 * 1000));
            } else {
                parsedDueDate = new Date(dueDate);
            }

            if (isNaN(parsedDueDate.getTime())) {
                throw new Error(`Invalid dueDate format`);
            }

            toInsert.push({
                apartmentId,
                amount: Number(amount),
                description: description ? String(description) : null,
                dueDate: parsedDueDate,
                status: 'PENDING'
            });

        } catch (err: any) {
            errorCount++;
            errors.push({ row: rowNum, reason: err.message });
        }
    }

    if (toInsert.length > 0) {
        await prisma.invoice.createMany({
            data: toInsert
        });
        successCount = toInsert.length;
    }

    return { successCount, errorCount, errors };
};
