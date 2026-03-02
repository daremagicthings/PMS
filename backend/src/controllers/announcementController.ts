import { Request, Response, NextFunction } from 'express';
import {
    createAnnouncement,
    getAllAnnouncements,
    updateAnnouncement,
    deleteAnnouncement,
    CreateAnnouncementInput,
    UpdateAnnouncementInput,
} from '../services/announcementService';
import { createNotification } from '../services/notificationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Controller for POST /api/announcements
 * Admin creates a new announcement or meeting schedule.
 * Auto-notifies all RESIDENT users about the new announcement.
 */
export const createAnnouncementController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = req.body as CreateAnnouncementInput;

        if (!input.title || !input.content || !input.createdById) {
            res.status(400).json({
                success: false,
                message: 'title, content, and createdById are required',
            });
            return;
        }

        const announcement = await createAnnouncement(input);

        // Auto-notify all residents about the new announcement
        try {
            const residents = await prisma.user.findMany({ where: { role: 'RESIDENT' } });
            for (const resident of residents) {
                await createNotification({
                    userId: resident.id,
                    title: 'Шинэ зарлал',
                    message: `"${input.title}" — шинэ зарлал нийтлэгдлээ`,
                    type: 'ANNOUNCEMENT',
                });
            }
        } catch (notifErr) {
            console.error('Failed to create announcement notifications:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: 'Announcement created successfully',
            data: announcement,
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
 * Controller for GET /api/announcements
 * Lists all announcements with creator info.
 */
export const getAllAnnouncementsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const announcements = await getAllAnnouncements();

        res.status(200).json({
            success: true,
            message: 'Announcements retrieved successfully',
            data: announcements,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/announcements/:id
 * Admin updates an existing announcement.
 */
export const updateAnnouncementController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const input = req.body as UpdateAnnouncementInput;

        const announcement = await updateAnnouncement(id, input);

        res.json({
            success: true,
            message: 'Announcement updated successfully',
            data: announcement,
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
 * Controller for DELETE /api/announcements/:id
 * Admin deletes an announcement.
 */
export const deleteAnnouncementController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await deleteAnnouncement(id);

        res.json({
            success: true,
            message: 'Announcement deleted successfully',
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
