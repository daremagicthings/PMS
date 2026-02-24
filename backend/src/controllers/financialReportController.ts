import { Request, Response, NextFunction } from 'express';
import {
    createFinancialReport,
    getAllFinancialReports,
    updateFinancialReport,
    deleteFinancialReport,
    CreateFinancialReportInput,
    UpdateFinancialReportInput,
} from '../services/financialReportService';

/**
 * Controller for POST /api/financial-reports
 * Admin creates a monthly financial report (with optional receipt/chart image).
 */
export const createFinancialReportController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { month, year, totalIncome, totalExpense, description } = req.body;

        if (month === undefined || year === undefined || totalIncome === undefined || totalExpense === undefined) {
            res.status(400).json({
                success: false,
                message: 'month, year, totalIncome, and totalExpense are required',
            });
            return;
        }

        // Build imageUrl from uploaded file (multer)
        const file = req.file;
        const imageUrl = file ? `/uploads/${file.filename}` : undefined;

        const input: CreateFinancialReportInput = {
            month: Number(month),
            year: Number(year),
            totalIncome: Number(totalIncome),
            totalExpense: Number(totalExpense),
            description,
            imageUrl,
        };

        const report = await createFinancialReport(input);

        res.status(201).json({
            success: true,
            message: 'Financial report created successfully',
            data: report,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('Unique constraint')) {
            res.status(409).json({
                success: false,
                message: `A financial report for ${req.body.month}/${req.body.year} already exists`,
            });
            return;
        }
        next(err);
    }
};

/**
 * Controller for GET /api/financial-reports
 * Lists all financial reports.
 */
export const getAllFinancialReportsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const reports = await getAllFinancialReports();

        res.status(200).json({
            success: true,
            message: 'Financial reports retrieved successfully',
            data: reports,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/financial-reports/:id
 * Admin updates an existing financial report (with optional image upload).
 */
export const updateFinancialReportController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { month, year, totalIncome, totalExpense, description } = req.body;

        // Build imageUrl from uploaded file (multer)
        const file = req.file;
        const imageUrl = file ? `/uploads/${file.filename}` : undefined;

        const input: UpdateFinancialReportInput = {
            ...(month !== undefined && { month: Number(month) }),
            ...(year !== undefined && { year: Number(year) }),
            ...(totalIncome !== undefined && { totalIncome: Number(totalIncome) }),
            ...(totalExpense !== undefined && { totalExpense: Number(totalExpense) }),
            ...(description !== undefined && { description }),
            ...(imageUrl !== undefined && { imageUrl }),
        };

        const report = await updateFinancialReport(id, input);

        res.json({
            success: true,
            message: 'Financial report updated successfully',
            data: report,
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
 * Controller for DELETE /api/financial-reports/:id
 * Admin deletes a financial report.
 */
export const deleteFinancialReportController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await deleteFinancialReport(id);

        res.json({
            success: true,
            message: 'Financial report deleted successfully',
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
