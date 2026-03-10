import prisma from '../lib/prisma';
import { Announcement, DocumentCategory } from '@prisma/client';

/** Shape of the create announcement request body */
export interface CreateAnnouncementInput {
    title: string;
    content: string;
    meetingLink?: string;
    category?: DocumentCategory;
    pdfUrl?: string;
    createdById: string;
}

/**
 * Creates a new announcement or meeting notice (Admin action).
 *
 * @param input - Announcement details including the creating admin's userId
 * @returns The newly created announcement
 * @throws Error if the creating user (admin) is not found
 */
export const createAnnouncement = async (input: CreateAnnouncementInput): Promise<Announcement> => {
    // Verify creator exists
    const user = await prisma.user.findFirst({ where: { id: input.createdById } });
    if (!user) {
        throw new Error(`User with ID ${input.createdById} not found`);
    }

    const announcement = await prisma.announcement.create({
        data: {
            title: input.title,
            content: input.content,
            meetingLink: input.meetingLink || null,
            category: input.category || 'ANNOUNCEMENT',
            pdfUrl: input.pdfUrl || null,
            createdById: input.createdById,
        },
    });

    return announcement;
};

/**
 * Retrieves all announcements with creator info, newest first.
 *
 * @returns Array of announcements with creator name
 */
export const getAllAnnouncements = async (category?: DocumentCategory): Promise<Announcement[]> => {
    const announcements = await prisma.announcement.findMany({
        where: category ? { category } : undefined,
        include: {
            createdBy: {
                select: { id: true, name: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return announcements;
};

/** Shape of the update announcement request body */
export interface UpdateAnnouncementInput {
    title?: string;
    content?: string;
    meetingLink?: string | null;
    category?: DocumentCategory;
    pdfUrl?: string | null;
}

/**
 * Updates an existing announcement.
 */
export const updateAnnouncement = async (
    id: string,
    input: UpdateAnnouncementInput
): Promise<Announcement> => {
    const existing = await prisma.announcement.findFirst({ where: { id } });
    if (!existing) throw new Error(`Announcement with ID ${id} not found`);

    const updated = await prisma.announcement.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.content !== undefined && { content: input.content }),
            ...(input.meetingLink !== undefined && { meetingLink: input.meetingLink }),
            ...(input.category !== undefined && { category: input.category }),
            ...(input.pdfUrl !== undefined && { pdfUrl: input.pdfUrl }),
        },
        include: { createdBy: { select: { id: true, name: true } } },
    });

    return updated;
};

/**
 * Deletes an announcement by ID.
 */
export const deleteAnnouncement = async (id: string): Promise<Announcement> => {
    const existing = await prisma.announcement.findFirst({ where: { id } });
    if (!existing) throw new Error(`Announcement with ID ${id} not found`);

    return prisma.announcement.delete({ where: { id } });
};
