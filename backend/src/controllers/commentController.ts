import { Request, Response, NextFunction } from 'express';
import {
    getCommentsByTicketId,
    addComment,
    AddCommentInput,
} from '../services/commentService';
import { createNotification } from '../services/notificationService';
import prisma from '../lib/prisma';

/**
 * Controller for GET /api/tickets/:id/comments
 * Returns all comments for a given ticket.
 */
export const getCommentsController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ticketId = req.params.id as string;
        const comments = await getCommentsByTicketId(ticketId);

        res.status(200).json({
            success: true,
            message: 'Comments retrieved successfully',
            data: comments,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};

/**
 * Controller for POST /api/tickets/:id/comments
 * Adds a new comment to a ticket.
 * Auto-generates a notification for the other party.
 */
export const addCommentController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const ticketId = req.params.id as string;
        const input = req.body as AddCommentInput;

        if (!input.userId || !input.content) {
            res.status(400).json({
                success: false,
                message: 'userId and content are required',
            });
            return;
        }

        const comment = await addComment(ticketId, input);

        // Auto-notify relevant parties about new comment
        try {
            const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
            const commenter = await prisma.user.findUnique({ where: { id: input.userId } });
            const commenterName = commenter?.name || 'Хэрэглэгч';

            if (ticket) {
                // Notify ticket owner if commenter is someone else (e.g. admin replied)
                if (ticket.userId !== input.userId) {
                    await createNotification({
                        userId: ticket.userId,
                        title: 'Шинэ хариу',
                        message: `${commenterName} "${ticket.title}" хүсэлтэд хариу бичлээ`,
                        type: 'NEW_COMMENT',
                    });
                }

                // Notify all admin users (except the commenter) so admins see resident comments
                const admins = await prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } });
                for (const admin of admins) {
                    if (admin.id !== input.userId) {
                        await createNotification({
                            userId: admin.id,
                            title: 'Шинэ коммент',
                            message: `${commenterName} "${ticket.title}" хүсэлтэд коммент бичлээ`,
                            type: 'NEW_COMMENT',
                        });
                    }
                }
            }
        } catch (notifErr) {
            console.error('Failed to create comment notification:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            data: comment,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        next(err);
    }
};
