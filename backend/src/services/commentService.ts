import prisma from '../lib/prisma';
import { TicketComment } from '@prisma/client';

/** Shape of the add comment request body */
export interface AddCommentInput {
    userId: string;
    content: string;
}

/**
 * Retrieves all comments for a given ticket, ordered by creation date.
 *
 * @param ticketId - UUID of the ticket
 * @returns Array of comments with user info
 * @throws Error if ticket not found
 */
export const getCommentsByTicketId = async (
    ticketId: string
): Promise<TicketComment[]> => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const comments = await prisma.ticketComment.findMany({
        where: { ticketId },
        include: {
            user: {
                select: { id: true, name: true, role: true },
            },
        },
        orderBy: { createdAt: 'asc' },
    });

    return comments;
};

/**
 * Adds a new comment to a ticket.
 *
 * @param ticketId - UUID of the ticket
 * @param input - Comment content and author userId
 * @returns The newly created comment
 * @throws Error if ticket or user not found
 */
export const addComment = async (
    ticketId: string,
    input: AddCommentInput
): Promise<TicketComment> => {
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
        throw new Error(`User with ID ${input.userId} not found`);
    }

    const comment = await prisma.ticketComment.create({
        data: {
            ticketId,
            userId: input.userId,
            content: input.content,
        },
        include: {
            user: {
                select: { id: true, name: true, role: true },
            },
        },
    });

    return comment;
};
