import prisma from '../lib/prisma';
import QRCode from 'qrcode';

/**
 * Generates mock E-Barimt (electronic receipt) data for a paid invoice.
 * In production, this would call the real E-Barimt API (ebarimt.mn).
 *
 * @param invoiceId - UUID of the paid invoice
 * @returns Updated invoice with E-Barimt fields
 */
export const generateEbarimt = async (invoiceId: string) => {
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } });

    if (!invoice) {
        throw new Error('Invoice not found');
    }

    if (invoice.status !== 'PAID') {
        throw new Error('E-Barimt can only be generated for paid invoices');
    }

    // If already generated, return existing data
    if (invoice.ebarimtId) {
        return invoice;
    }

    // ── Mock E-Barimt Data ──────────────────────────────
    const ebarimtId = `EB${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    const lotteryNumber = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');

    // Generate real QR PNG as base64
    const qrPayload = JSON.stringify({
        id: ebarimtId,
        lottery: lotteryNumber,
        amount: invoice.amount,
        date: new Date().toISOString(),
    });

    const ebarimtQrCode = await QRCode.toDataURL(qrPayload, {
        width: 250,
        margin: 2,
        color: { dark: '#0f172a', light: '#ffffff' },
    });

    const updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
            ebarimtId,
            lotteryNumber,
            ebarimtQrCode,
        },
    });

    return updatedInvoice;
};
