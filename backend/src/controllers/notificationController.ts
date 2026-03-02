import { Request, Response, NextFunction } from 'express';
import {
    getNotificationsByUserId,
    getUnreadCount,
    markAsRead,
    markAllAsRead,
} from '../services/notificationService';

/**
 * GET /api/notifications?userId=xxx
 * Returns notifications for a given user.
 */
export const getNotificationsController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'userId query parameter is required' });
            return;
        }

        const notifications = await getNotificationsByUserId(userId);
        const unreadCount = await getUnreadCount(userId);

        res.json({
            success: true,
            message: 'Notifications retrieved successfully',
            data: { notifications, unreadCount },
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/notifications/:id/read
 * Marks a single notification as read.
 */
export const markAsReadController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const notification = await markAsRead(id as string);

        res.json({
            success: true,
            message: 'Notification marked as read',
            data: notification,
        });
    } catch (err) {
        next(err);
    }
};

/**
 * PUT /api/notifications/read-all?userId=xxx
 * Marks all notifications as read for a user.
 */
export const markAllAsReadController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId } = req.query;
        if (!userId || typeof userId !== 'string') {
            res.status(400).json({ success: false, message: 'userId query parameter is required' });
            return;
        }

        const count = await markAllAsRead(userId);

        res.json({
            success: true,
            message: `${count} notification(s) marked as read`,
            data: { updatedCount: count },
        });
    } catch (err) {
        next(err);
    }
};
