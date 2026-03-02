import { Router } from 'express';
import { qpayWebhookController } from '../controllers/qpayController';

const router = Router();

/**
 * POST /api/webhooks/qpay — QPay payment success callback.
 * PUBLIC endpoint — no auth required (external payment provider).
 * In production, verify QPay signature before processing.
 */
router.post('/', qpayWebhookController);

export default router;
