import { Request, Response, NextFunction } from 'express';
import { createPoll, getAllPolls, castVote, closePoll, CreatePollInput } from '../services/pollService';

/**
 * Controller for POST /api/polls
 * Admin creates a new poll with options.
 */
export const createPollController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = req.body as CreatePollInput;

        if (!input.title || !input.options || input.options.length < 2) {
            res.status(400).json({
                success: false,
                message: 'title and at least 2 options are required',
            });
            return;
        }

        const poll = await createPoll(input);

        res.status(201).json({
            success: true,
            message: 'Poll created successfully',
            data: poll,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for GET /api/polls
 * Lists all polls with options and vote counts.
 */
export const getAllPollsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const polls = await getAllPolls();

        res.status(200).json({
            success: true,
            message: 'Polls retrieved successfully',
            data: polls,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for POST /api/polls/:id/vote
 * Resident casts a vote. Sends userId in body (or from auth middleware).
 */
export const castVoteController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const pollId = req.params.id as string;
        const { userId, optionId } = req.body as { userId: string; optionId: string };

        if (!userId || !optionId) {
            res.status(400).json({
                success: false,
                message: 'userId and optionId are required',
            });
            return;
        }

        const vote = await castVote(userId, pollId, optionId);

        // Auto-notify admins when a resident votes
        try {
            const { createNotification } = await import('../services/notificationService');
            import('../lib/prisma').then(({ default: prisma }) => {
                prisma.poll.findUnique({ where: { id: pollId }, include: { options: true } }).then(poll => {
                    if (!poll) return;
                    prisma.user.findUnique({ where: { id: userId } }).then(voter => {
                        const voterName = voter?.name || 'Оршин суугч';
                        const optionText = poll.options.find(o => o.id === optionId)?.text || 'сонголт';
                        prisma.user.findMany({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }).then(admins => {
                            admins.forEach(admin => {
                                createNotification({
                                    userId: admin.id,
                                    title: 'Санал өгөгдлөө',
                                    message: `${voterName} "${poll.title}" санал асуулгад "${optionText}" гэж саналаа өглөө.`,
                                    type: 'SYSTEM',
                                });
                            });
                        });
                    });
                });
            });
        } catch (notifErr) {
            console.error('Failed to create poll vote notification:', notifErr);
        }

        res.status(201).json({
            success: true,
            message: 'Vote cast successfully',
            data: vote,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');

        if (err.message.includes('already voted')) {
            res.status(409).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('closed') || err.message.includes('not found') || err.message.includes('Invalid')) {
            res.status(400).json({ success: false, message: err.message });
            return;
        }

        next(err);
    }
};

/**
 * Controller for PUT /api/polls/:id/close
 * Admin closes a poll.
 */
export const closePollController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const poll = await closePoll(req.params.id as string);

        res.status(200).json({
            success: true,
            message: 'Poll closed successfully',
            data: poll,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};
