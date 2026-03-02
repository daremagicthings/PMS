import prisma from '../lib/prisma';
import { Notification, NotificationType } from '@prisma/client';
import { sendPushToUser } from './pushNotificationService';

/** Shape of the create notification input */
export interface CreateNotificationInput {
    userId: string;
    title: string;
    message: string;
    type: NotificationType;
}

/**
 * Retrieves notifications for a user, ordered by most recent first.
 *
 * @param userId - UUID of the user
 * @returns Array of notifications (max 50)
 * @throws Error if retrieval fails
 */
export const getNotificationsByUserId = async (
    userId: string
): Promise<Notification[]> => {
    const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
    });

    return notifications;
};

/**
 * Returns the count of unread notifications for a user.
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
    return prisma.notification.count({
        where: { userId, isRead: false },
    });
};

/**
 * Marks a single notification as read.
 *
 * @param id - UUID of the notification
 * @returns Updated notification
 * @throws Error if notification not found
 */
export const markAsRead = async (id: string): Promise<Notification> => {
    const notification = await prisma.notification.update({
        where: { id },
        data: { isRead: true },
    });

    return notification;
};

/**
 * Marks all notifications for a user as read.
 *
 * @param userId - UUID of the user
 * @returns Count of updated records
 */
export const markAllAsRead = async (userId: string): Promise<number> => {
    const result = await prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
    });

    return result.count;
};

/**
 * Creates a new notification for a user and sends a push notification.
 * Used internally by other services to auto-generate notifications.
 *
 * @param input - Notification data
 * @returns The created notification
 */
export const createNotification = async (
    input: CreateNotificationInput
): Promise<Notification> => {
    const notification = await prisma.notification.create({
        data: {
            userId: input.userId,
            title: input.title,
            message: input.message,
            type: input.type,
        },
    });

    // Fire-and-forget push notification (never blocks the main flow)
    sendPushToUser(input.userId, input.title, input.message, {
        type: input.type,
        notificationId: notification.id,
    });

    return notification;
};

