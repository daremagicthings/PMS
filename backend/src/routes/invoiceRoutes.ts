import { Router } from 'express';
import {
    createInvoiceController,
    getAllInvoicesController,
    markInvoiceAsPaidController,
    getEbarimtController,
} from '../controllers/invoiceController';
import { createQpayInvoiceController } from '../controllers/qpayController';

const router = Router();

/** POST /api/invoices — Admin creates a new invoice */
router.post('/', createInvoiceController);

/** GET /api/invoices — List all invoices */
router.get('/', getAllInvoicesController);

/** PUT /api/invoices/:id/pay — Mark invoice as PAID */
router.put('/:id/pay', markInvoiceAsPaidController);

/** POST /api/invoices/:id/qpay — Generate QPay invoice with QR + deep links */
router.post('/:id/qpay', createQpayInvoiceController);

/** GET /api/invoices/:id/ebarimt — Get or generate E-Barimt receipt */
router.get('/:id/ebarimt', getEbarimtController);

export default router;
