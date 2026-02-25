import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware';
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

// Protected (Admins only)
router.post('/faqs', authMiddleware, createFaqController);
router.put('/faqs/:id', authMiddleware, updateFaqController);
router.delete('/faqs/:id', authMiddleware, deleteFaqController);

/**
 * =======================
 * Static Content (Rules, Inquiries, etc)
 * =======================
 */

// Public (Residents & Admins)
router.get('/static/:type', getStaticContentController);

// Protected (Admins only)
router.put('/static/:type', authMiddleware, upsertStaticContentController);

export default router;
