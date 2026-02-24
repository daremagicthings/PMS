import { Request, Response, NextFunction } from 'express';
import {
    createInvoice,
    getAllInvoices,
    markInvoiceAsPaid,
    CreateInvoiceInput,
} from '../services/invoiceService';
import { generateEbarimt } from '../services/ebarimtService';

/**
 * Controller for POST /api/invoices
 * Admin generates a new invoice for an apartment.
 */
export const createInvoiceController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = req.body as CreateInvoiceInput;

        if (!input.apartmentId || !input.amount || !input.dueDate) {
            res.status(400).json({
                success: false,
                message: 'apartmentId, amount, and dueDate are required',
            });
            return;
        }

        const invoice = await createInvoice(input);

        res.status(201).json({
            success: true,
            message: 'Invoice created successfully',
            data: invoice,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

/**
 * Controller for GET /api/invoices
 * Lists all invoices with apartment info.
 */
export const getAllInvoicesController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const invoices = await getAllInvoices();

        res.status(200).json({
            success: true,
            message: 'Invoices retrieved successfully',
            data: invoices,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/invoices/:id/pay
 * Marks an invoice as PAID. Constitution: No hard-delete for financial data.
 */
export const markInvoiceAsPaidController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;

        const invoice = await markInvoiceAsPaid(id);

        res.status(200).json({
            success: true,
            message: 'Invoice marked as paid',
            data: invoice,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('already') || err.message.includes('Cannot')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

/**
 * Controller for GET /api/invoices/:id/ebarimt
 * Returns E-Barimt data for a paid invoice. Generates if not yet created.
 */
export const getEbarimtController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const invoiceId = req.params.id as string;
        const invoice = await generateEbarimt(invoiceId);

        res.status(200).json({
            success: true,
            message: 'E-Barimt retrieved successfully',
            data: {
                ebarimtId: invoice.ebarimtId,
                lotteryNumber: invoice.lotteryNumber,
                ebarimtQrCode: invoice.ebarimtQrCode,
                amount: invoice.amount,
            },
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('only be generated')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};
