import { Router, Request, Response, NextFunction } from 'express';
import * as contactController from '../controllers/contactController';
import { authMiddleware } from '../middlewares/authMiddleware';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        res.status(403).json({ success: false, message: 'Admin access required' });
        return;
    }
    next();
};

const router = Router();

// Publicly readable by residents and admins
router.get('/', authMiddleware, contactController.getContacts);

// Admin only routes
router.post('/', authMiddleware, requireAdmin, contactController.createContact);
router.put('/:id', authMiddleware, requireAdmin, contactController.updateContact);
router.delete('/:id', authMiddleware, requireAdmin, contactController.deleteContact);

export default router;
