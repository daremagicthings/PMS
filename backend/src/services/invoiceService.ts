import prisma from '../lib/prisma';
import { Invoice, InvoiceStatus } from '@prisma/client';

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

/**
 * Retrieves all invoices with their linked apartment data.
 *
 * @returns Array of invoices with apartment info
 */
export const getAllInvoices = async (): Promise<Invoice[]> => {
    const invoices = await prisma.invoice.findMany({
        include: {
            apartment: {
                select: {
                    id: true,
                    buildingName: true,
                    unitNumber: true,
                    entrance: true,
                    floor: true,
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
export const getInvoicesForResident = async (userId: string): Promise<Invoice[]> => {
    const invoices = await prisma.invoice.findMany({
        where: {
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
