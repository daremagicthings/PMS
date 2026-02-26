import { Request, Response, NextFunction } from 'express';
import {
    generateQpayInvoice,
    processQpayWebhook,
} from '../services/qpayService';

/**
 * Controller for POST /api/invoices/:id/qpay
 * Generates a mock QPay invoice with QR code and deep links.
 *
 * Constitution: Controller only handles req/res — business logic is in qpayService.
 */
export const createQpayInvoiceController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const invoiceId = req.params.id as string;

        const result = await generateQpayInvoice(invoiceId);

        res.status(200).json({
            success: true,
            message: 'QPay invoice generated successfully',
            data: result,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('already paid') || err.message.includes('Cannot')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

/**
 * Controller for POST /api/invoices/qpay-bulk
 * Generates a mock QPay bulk invoice for multiple invoice IDs.
 */
export const createBulkQpayInvoiceController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { invoiceIds } = req.body as { invoiceIds: string[] };

        if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
            res.status(400).json({ success: false, message: 'invoiceIds array is required' });
            return;
        }

        const { generateBulkQpayInvoice } = await import('../services/qpayService');
        const result = await generateBulkQpayInvoice(invoiceIds);

        res.status(200).json({
            success: true,
            message: 'Bulk QPay invoice generated successfully',
            data: result,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found') || err.message.includes('already paid') || err.message.includes('cancelled')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

/**
 * Controller for POST /api/webhooks/qpay
 * Handles QPay payment success webhook.
 * This endpoint is PUBLIC — no auth required (simulates external callback).
 *
 * Constitution: Controller only handles req/res — business logic is in qpayService.
 */
export const qpayWebhookController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { qpayInvoiceId } = req.body as { qpayInvoiceId: string };

        if (!qpayInvoiceId) {
            res.status(400).json({
                success: false,
                message: 'qpayInvoiceId is required',
            });
            return;
        }

        const invoice = await processQpayWebhook(qpayInvoiceId);

        console.log(`✅ QPay Webhook: Invoice ${invoice.id} marked as PAID (QPay ID: ${qpayInvoiceId})`);

        res.status(200).json({
            success: true,
            message: 'Payment processed successfully',
            data: invoice,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('No invoice found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('Cannot')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};
