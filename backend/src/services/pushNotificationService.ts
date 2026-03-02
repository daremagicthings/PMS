import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import prisma from '../lib/prisma';

// ─── Expo Push Client (singleton) ───────────────────────
const expo = new Expo();

/**
 * Sends a push notification to a user via their Expo push token.
 * Silently skips if the user has no token or the token is invalid.
 *
 * @param userId - UUID of the target user
 * @param title - Notification title
 * @param body - Notification body text
 * @param data - Optional extra data payload
 */
export const sendPushToUser = async (
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { expoPushToken: true },
        });

        if (!user?.expoPushToken || !Expo.isExpoPushToken(user.expoPushToken)) {
            return; // No valid token — skip silently
        }

        const message: ExpoPushMessage = {
            to: user.expoPushToken,
            sound: 'default',
            title,
            body,
            data: data || {},
        };

        const chunks = expo.chunkPushNotifications([message]);
        for (const chunk of chunks) {
            const tickets: ExpoPushTicket[] = await expo.sendPushNotificationsAsync(chunk);
            for (const ticket of tickets) {
                if (ticket.status === 'error') {
                    console.error(`Push notification error: ${ticket.message}`);
                }
            }
        }
    } catch (error) {
        // Push failures should not crash the main flow
        console.error('Failed to send push notification:', error);
    }
};

/**
 * Sends push notifications to multiple users at once.
 * Filters out users without valid tokens and batches efficiently.
 *
 * @param userIds - Array of user UUIDs
 * @param title - Notification title
 * @param body - Notification body text
 * @param data - Optional extra data payload
 */
export const sendPushToUsers = async (
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<void> => {
    try {
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { expoPushToken: true },
        });

        const messages: ExpoPushMessage[] = users
            .filter((u) => u.expoPushToken && Expo.isExpoPushToken(u.expoPushToken))
            .map((u) => ({
                to: u.expoPushToken!,
                sound: 'default' as const,
                title,
                body,
                data: data || {},
            }));

        if (messages.length === 0) return;

        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            const tickets = await expo.sendPushNotificationsAsync(chunk);
            for (const ticket of tickets) {
                if (ticket.status === 'error') {
                    console.error(`Push notification error: ${ticket.message}`);
                }
            }
        }
    } catch (error) {
        console.error('Failed to send batch push notifications:', error);
    }
};
