import { Router } from 'express';
import {
    createFinancialReportController,
    getAllFinancialReportsController,
    updateFinancialReportController,
    deleteFinancialReportController,
    downloadPdfController,
} from '../controllers/financialReportController';
import { uploadSingle } from '../middlewares/uploadMiddleware';

const router = Router();

/** GET /api/financial-reports/:id/pdf — Download PDF report */
router.get('/:id/pdf', downloadPdfController);

/** POST /api/financial-reports — Admin creates a financial report (with optional image) */
router.post('/', uploadSingle, createFinancialReportController);

/** GET /api/financial-reports — List all financial reports */
router.get('/', getAllFinancialReportsController);

/** PUT /api/financial-reports/:id — Admin updates a financial report (with optional image) */
router.put('/:id', uploadSingle, updateFinancialReportController);

/** DELETE /api/financial-reports/:id — Admin deletes a financial report */
router.delete('/:id', deleteFinancialReportController);

export default router;
