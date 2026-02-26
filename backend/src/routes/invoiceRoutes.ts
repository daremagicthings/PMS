import { Router } from 'express';
import {
    createInvoiceController,
    getAllInvoicesController,
    markInvoiceAsPaidController,
    getEbarimtController,
    calculatePenaltiesController,
} from '../controllers/invoiceController';
import { createQpayInvoiceController } from '../controllers/qpayController';

const router = Router();

/** POST /api/invoices — Admin creates a new invoice */
router.post('/', createInvoiceController);

/** GET /api/invoices — List all invoices (admin=all, resident=own) */
router.get('/', getAllInvoicesController);

/** POST /api/invoices/calculate-penalties — Admin calculates penalties */
router.post('/calculate-penalties', calculatePenaltiesController);

/** PUT /api/invoices/:id/pay — Mark invoice as PAID */
router.put('/:id/pay', markInvoiceAsPaidController);

/** POST /api/invoices/:id/qpay — Generate QPay invoice with QR + deep links */
router.post('/:id/qpay', createQpayInvoiceController);

/** POST /api/invoices/qpay-bulk — Generate QPay bulk invoice */
router.post('/qpay-bulk', async (req, res, next) => {
    const { createBulkQpayInvoiceController } = await import('../controllers/qpayController');
    createBulkQpayInvoiceController(req, res, next);
});

/** GET /api/invoices/:id/ebarimt — Get or generate E-Barimt receipt */
router.get('/:id/ebarimt', getEbarimtController);

export default router;

