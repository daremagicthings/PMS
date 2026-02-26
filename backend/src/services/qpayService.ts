import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';
import prisma from '../lib/prisma';
import { Invoice, InvoiceStatus } from '@prisma/client';
import { generateEbarimt } from './ebarimtService';

// ─── Types ──────────────────────────────────────────────

/** Mock bank deep link entry */
export interface QpayBankLink {
    name: string;
    shortName: string;
    icon: string;
    color: string;
    link: string;
}

/** Response returned when generating a QPay invoice */
export interface QpayInvoiceResult {
    qpayInvoiceId: string;
    qpayUrl: string;
    qrBase64: string;
    deepLinks: QpayBankLink[];
    invoice: Invoice;
}

// ─── Mock QPay Config ───────────────────────────────────

/**
 * Simulated bank deep links that would come from the QPay API.
 * In production, these are returned by QPay's /invoice endpoint.
 * Each bank has a distinct brand color for visual identification.
 */
const MOCK_BANK_DEEP_LINKS: QpayBankLink[] = [
    { name: 'Khan Bank', shortName: 'KB', icon: '🟢', color: '#00A859', link: 'khanbank://qpay?invoice=' },
    { name: 'Golomt Bank', shortName: 'GL', icon: '🔵', color: '#003DA5', link: 'golomtbank://qpay?invoice=' },
    { name: 'State Bank', shortName: 'SB', icon: '🟠', color: '#E8600A', link: 'statebank://qpay?invoice=' },
    { name: 'TDB', shortName: 'TD', icon: '🔴', color: '#D42027', link: 'tdbm://qpay?invoice=' },
    { name: 'Xac Bank', shortName: 'XB', icon: '🟣', color: '#6B2D8B', link: 'xacbank://qpay?invoice=' },
];

/**
 * Generates a real PNG QR code as a Base64 data URI.
 * Uses the `qrcode` npm package — output is `data:image/png;base64,...`
 * which React Native Image can display directly.
 */
const generateQrBase64 = async (value: string): Promise<string> => {
    return QRCode.toDataURL(value, {
        width: 300,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
    });
};


// ─── Service Functions ──────────────────────────────────

/**
 * Generates a mock QPay invoice for an existing system invoice.
 * In production, this would call QPay's REST API with the merchant credentials.
 *
 * @param invoiceId - UUID of the invoice to generate a QPay link for
 * @returns QPay invoice data including QR code and deep links
 * @throws Error if invoice not found, already paid, or cancelled
 */
export const generateQpayInvoice = async (invoiceId: string): Promise<QpayInvoiceResult> => {
    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
    });

    if (!invoice) {
        throw new Error(`Invoice with ID ${invoiceId} not found`);
    }

    if (invoice.status === InvoiceStatus.PAID) {
        throw new Error('Invoice is already paid');
    }

    if (invoice.status === InvoiceStatus.CANCELLED) {
        throw new Error('Cannot generate QPay for a cancelled invoice');
    }

    // If a QPay invoice was already generated, return existing data
    if (invoice.qpayInvoiceId) {
        return {
            qpayInvoiceId: invoice.qpayInvoiceId,
            qpayUrl: invoice.qpayUrl || '',
            qrBase64: await generateQrBase64(`https://qpay.mn/payment/${invoice.qpayInvoiceId}`),
            deepLinks: MOCK_BANK_DEEP_LINKS.map((bank) => ({
                ...bank,
                link: `${bank.link}${invoice.qpayInvoiceId}`,
            })),
            invoice,
        };
    }

    // ── Mock QPay API Call ───────────────────────────────
    // In production: POST https://merchant.qpay.mn/v2/invoice
    const qpayInvoiceId = `QPAY-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qpayUrl = `qpay://invoice/${qpayInvoiceId}`;

    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            qpayInvoiceId,
            qpayUrl,
        },
    });

    return {
        qpayInvoiceId,
        qpayUrl,
        qrBase64: await generateQrBase64(`https://qpay.mn/payment/${qpayInvoiceId}`),
        deepLinks: MOCK_BANK_DEEP_LINKS.map((bank) => ({
            ...bank,
            link: `${bank.link}${qpayInvoiceId}`,
        })),
        invoice: updatedInvoice,
    };
};

/**
 * Generates a mock QPay invoice for multiple system invoices (bulk payment).
 *
 * @param invoiceIds - UUIDs of the invoices to pay together
 * @returns QPay invoice data including QR code and deep links
 */
export const generateBulkQpayInvoice = async (invoiceIds: string[]): Promise<QpayInvoiceResult> => {
    if (!invoiceIds || invoiceIds.length === 0) {
        throw new Error('No invoices provided for bulk payment');
    }

    const invoices = await prisma.invoice.findMany({
        where: { id: { in: invoiceIds } },
    });

    if (invoices.length !== invoiceIds.length) {
        throw new Error('One or more invoices were not found');
    }

    for (const inv of invoices) {
        if (inv.status === InvoiceStatus.PAID) {
            throw new Error(`Invoice ${inv.id} is already paid`);
        }
        if (inv.status === InvoiceStatus.CANCELLED) {
            throw new Error(`Invoice ${inv.id} is cancelled`);
        }
    }

    const qpayInvoiceId = `QPAY-BULK-${uuidv4().substring(0, 8).toUpperCase()}`;
    const qpayUrl = `qpay://invoice/${qpayInvoiceId}`;

    await prisma.invoice.updateMany({
        where: { id: { in: invoiceIds } },
        data: {
            qpayInvoiceId,
            qpayUrl,
        },
    });

    // Return the first one as representative.
    const updatedInvoice = await prisma.invoice.findFirst({ where: { id: invoiceIds[0] } });

    return {
        qpayInvoiceId,
        qpayUrl,
        qrBase64: await generateQrBase64(`https://qpay.mn/payment/${qpayInvoiceId}`),
        deepLinks: MOCK_BANK_DEEP_LINKS.map((bank) => ({
            ...bank,
            link: `${bank.link}${qpayInvoiceId}`,
        })),
        invoice: updatedInvoice as Invoice,
    };
};

/**
 * Processes a QPay webhook callback when a payment is confirmed.
 * In production, you would verify the QPay signature/secret before processing.
 *
 * @param qpayInvoiceId - The QPay invoice ID sent via webhook
 * @returns The updated invoice marked as PAID
 * @throws Error if the QPay invoice ID is not found or invoice already paid
 */
export const processQpayWebhook = async (qpayInvoiceId: string): Promise<Invoice> => {
    const invoices = await prisma.invoice.findMany({
        where: { qpayInvoiceId },
    });

    if (invoices.length === 0) {
        throw new Error(`No invoice found for QPay ID: ${qpayInvoiceId}`);
    }

    const unpaidInvoices = invoices.filter(
        (inv) => inv.status !== InvoiceStatus.PAID && inv.status !== InvoiceStatus.CANCELLED
    );

    if (unpaidInvoices.length > 0) {
        await prisma.invoice.updateMany({
            where: { id: { in: unpaidInvoices.map((i) => i.id) } },
            data: {
                status: 'PAID',
                paidAt: new Date(),
            },
        });

        // Fire-and-forget: auto-generate E-Barimt for the paid invoices
        for (const inv of unpaidInvoices) {
            generateEbarimt(inv.id).catch((err) =>
                console.error(`E-Barimt auto-generation failed for invoice ${inv.id}:`, err)
            );
        }
    }

    const updated = await prisma.invoice.findFirst({ where: { qpayInvoiceId } });
    return updated as Invoice;
};
