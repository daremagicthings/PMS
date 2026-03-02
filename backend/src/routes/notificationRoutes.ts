import { Router } from 'express';
import {
    getNotificationsController,
    markAsReadController,
    markAllAsReadController,
} from '../controllers/notificationController';

/**
 * Notification routes.
 * GET  /api/notifications?userId=xxx
 * PUT  /api/notifications/read-all?userId=xxx
 * PUT  /api/notifications/:id/read
 */
const router = Router();

router.get('/', getNotificationsController);
router.put('/read-all', markAllAsReadController);
router.put('/:id/read', markAsReadController);

export default router;
