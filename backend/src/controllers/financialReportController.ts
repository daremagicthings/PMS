import { Request, Response, NextFunction } from 'express';
import PDFDocument from 'pdfkit';
import {
    createFinancialReport,
    getAllFinancialReports,
    updateFinancialReport,
    deleteFinancialReport,
    getFinancialReportById,
    CreateFinancialReportInput,
    UpdateFinancialReportInput,
} from '../services/financialReportService';

export const downloadPdfController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const report = await getFinancialReportById(id);

        if (!report) {
            res.status(404).json({ success: false, message: 'Report not found' });
            return;
        }

        const doc = new PDFDocument({ margin: 50 });
        
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=SOH_Report_${report.year}_${report.month}.pdf`);

        doc.pipe(res);

        // Header
        doc.fontSize(24).font('Helvetica-Bold').text('SOH SYSTEM', { align: 'center' });
        doc.fontSize(16).font('Helvetica').text(`Financial Transparency Report`, { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Period: ${report.year} / ${report.month}`, { align: 'center' });
        doc.moveDown(2);

        // Summary
        doc.fontSize(14).font('Helvetica-Bold').text('Summary');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();
        doc.fontSize(12).font('Helvetica');
        doc.text(`Total Income: MNT ${report.totalIncome.toLocaleString()}`);
        doc.text(`Total Expense: MNT ${report.totalExpense.toLocaleString()}`);
        const balance = report.totalIncome - report.totalExpense;
        doc.text(`Net Balance: MNT ${balance.toLocaleString()}`);
        doc.moveDown(2);

        // Transactions
        doc.fontSize(14).font('Helvetica-Bold').text('Detailed Transactions');
        doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
        doc.moveDown();

        if (report.transactions && report.transactions.length > 0) {
            report.transactions.forEach((t) => {
                doc.fontSize(12).font('Helvetica-Bold').text(`${t.date.toISOString().split('T')[0]} - ${t.type}`);
                doc.fontSize(10).font('Helvetica').text(`Amount: MNT ${t.amount.toLocaleString()}`);
                doc.text(`Description: ${t.description}`);
                doc.text(`Sender/Receiver: ${t.receiverSender}`);
                doc.moveDown(0.5);
            });
        } else {
            doc.fontSize(12).font('Helvetica-Oblique').text('No detailed transactions found for this period.');
        }

        doc.end();
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error during PDF generation'));
    }
};

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
