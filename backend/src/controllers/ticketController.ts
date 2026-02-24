import { Request, Response, NextFunction } from 'express';
import {
    createTicket,
    getAllTickets,
    updateTicketStatus,
    CreateTicketInput,
    UpdateTicketStatusInput,
} from '../services/ticketService';
import { createNotification } from '../services/notificationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controller for POST /api/tickets
 * Resident creates a new maintenance ticket (with optional image upload).
 * Auto-notifies all ADMIN users about the new ticket.
 */
export const createTicketController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { userId, apartmentId, title, description } = req.body;

        if (!userId || !apartmentId || !title || !description) {
            res.status(400).json({
                success: false,
                message: 'userId, apartmentId, title, and description are required',
            });
            return;
        }

        // Build imageUrl from uploaded file (multer)
        const file = req.file;
        const imageUrl = file ? `/uploads/${file.filename}` : undefined;

        const input: CreateTicketInput = {
            userId,
            apartmentId,
            title,
            description,
            imageUrl,
        };

        const ticket = await createTicket(input);

        // Auto-notify all admin users about the new ticket
        try {
            const creator = await prisma.user.findUnique({ where: { id: userId } });
            const creatorName = creator?.name || 'Оршин суугч';
            const admins = await prisma.user.findMany({ where: { role: 'ADMIN' } });
            for (const admin of admins) {
                await createNotification({
                    userId: admin.id,
                    title: 'Шинэ хүсэлт',
                    message: `${creatorName} "${title}" хүсэлт илгээлээ`,
                    type: 'TICKET_UPDATE',
                });
            }
        } catch (notifErr) {
            console.error('Failed to create ticket notification:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: 'Ticket created successfully',
            data: ticket,
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
 * Controller for GET /api/tickets
 * Lists all tickets with user and apartment info.
 */
export const getAllTicketsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const tickets = await getAllTickets();

        res.status(200).json({
            success: true,
            message: 'Tickets retrieved successfully',
            data: tickets,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/tickets/:id/status
 * Admin updates ticket status (NEW → IN_PROGRESS → RESOLVED).
 * Auto-generates a notification for the ticket owner.
 */
export const updateTicketStatusController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const input = req.body as UpdateTicketStatusInput;

        if (!input.status) {
            res.status(400).json({
                success: false,
                message: 'status is required (NEW, IN_PROGRESS, or RESOLVED)',
            });
            return;
        }

        const ticket = await updateTicketStatus(id, input);

        // Auto-notify ticket owner about status change
        try {
            const statusLabel = input.status.replace('_', ' ').toLowerCase();
            await createNotification({
                userId: ticket.userId,
                title: 'Хүсэлтийн төлөв шинэчлэгдлээ',
                message: `"${ticket.title}" хүсэлт "${statusLabel}" төлөвт шилжлээ`,
                type: 'TICKET_UPDATE',
            });
        } catch (notifErr) {
            console.error('Failed to create notification:', notifErr);
        }

        res.status(200).json({
            success: true,
            message: 'Ticket status updated successfully',
            data: ticket,
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
