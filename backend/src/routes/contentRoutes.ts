import { Router } from 'express';
// import { authMiddleware } from '../middlewares/authMiddleware';
import {
    createFaqController,
    getFaqsController,
    updateFaqController,
    deleteFaqController,
    getStaticContentController,
    upsertStaticContentController,
} from '../controllers/contentController';

const router = Router();

/**
 * =======================
 * FAQs
 * =======================
 */

// Public (Residents & Admins)
router.get('/faqs', getFaqsController);

// Protected (Admins only - temporarily open for Web Admin MVP)
router.post('/faqs', createFaqController);
router.put('/faqs/:id', updateFaqController);
router.delete('/faqs/:id', deleteFaqController);

/**
 * =======================
 * Static Content (Rules, Inquiries, etc)
 * =======================
 */

// Public (Residents & Admins)
router.get('/static/:type', getStaticContentController);

// Protected (Admins only - temporarily open for Web Admin MVP)
router.put('/static/:type', upsertStaticContentController);

export default router;
