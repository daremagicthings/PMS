import prisma from '../lib/prisma';
import { Ticket, TicketStatus } from '@prisma/client';

/** Shape of the create ticket request body */
export interface CreateTicketInput {
    userId: string;
    apartmentId: string;
    title: string;
    description: string;
    imageUrl?: string;
}

/** Shape of the update ticket status request body */
export interface UpdateTicketStatusInput {
    status: TicketStatus;
}

/**
 * Creates a new maintenance ticket submitted by a resident.
 *
 * @param input - Ticket details including userId and apartmentId
 * @returns The newly created ticket
 * @throws Error if user or apartment not found
 */
export const createTicket = async (input: CreateTicketInput): Promise<Ticket> => {
    // Verify user exists to provide a friendly error message
    const user = await prisma.user.findUnique({ where: { id: input.userId } });
    if (!user) {
        throw new Error(`Бүртгэл олдсонгүй (User not found). Бааз шинэчлэгдсэн тул та 'Log out' хийгээд дахин нэвтэрнэ үү.`);
    }

    // Verify apartment exists
    const apartment = await prisma.apartment.findUnique({ where: { id: input.apartmentId } });
    if (!apartment) {
        throw new Error(`Байрны мэдээлэл олдсонгүй (Apartment not found). Та 'Log out' хийгээд дахин нэвтэрнэ үү.`);
    }

    const ticket = await prisma.ticket.create({
        data: {
            userId: input.userId,
            apartmentId: input.apartmentId,
            title: input.title,
            description: input.description,
            imageUrl: input.imageUrl || null,
            status: 'NEW',
        },
    });

    return ticket;
};

/**
 * Retrieves all tickets with user and apartment info.
 *
 * @returns Array of tickets with related data
 */
export const getAllTickets = async (): Promise<Ticket[]> => {
    const tickets = await prisma.ticket.findMany({
        include: {
            user: {
                select: { id: true, name: true, phone: true },
            },
            apartment: {
                select: { id: true, buildingName: true, unitNumber: true },
            },
            _count: {
                select: { comments: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return tickets;
};

/**
 * Updates the status of a ticket (Admin action).
 * Valid transitions: NEW → IN_PROGRESS → RESOLVED
 *
 * @param ticketId - UUID of the ticket
 * @param input - New status value
 * @returns The updated ticket
 * @throws Error if ticket not found
 */
export const updateTicketStatus = async (
    ticketId: string,
    input: UpdateTicketStatusInput
): Promise<Ticket> => {
    const existing = await prisma.ticket.findUnique({ where: { id: ticketId } });

    if (!existing) {
        throw new Error(`Ticket with ID ${ticketId} not found`);
    }

    const updated = await prisma.ticket.update({
        where: { id: ticketId },
        data: { status: input.status },
    });

    return updated;
};
