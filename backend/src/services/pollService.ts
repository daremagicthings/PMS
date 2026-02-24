import prisma from '../lib/prisma';
import { Poll, PollOption, PollVote, PollStatus } from '@prisma/client';

// ─── Types ──────────────────────────────────────────────

export interface CreatePollInput {
    title: string;
    description?: string;
    endDate?: string;
    options: string[];
}

export interface PollWithDetails extends Poll {
    options: (PollOption & { _count: { votes: number } })[];
    _count: { votes: number };
}

// ─── Service Functions ──────────────────────────────────

/**
 * Creates a new poll with its options (Admin only).
 *
 * @param input - Poll title, description, endDate, and at least 2 options
 * @returns The created poll with options
 */
export const createPoll = async (input: CreatePollInput): Promise<Poll> => {
    const poll = await prisma.poll.create({
        data: {
            title: input.title,
            description: input.description || null,
            endDate: input.endDate ? new Date(input.endDate) : null,
            options: {
                create: input.options.map((text) => ({ text })),
            },
        },
        include: {
            options: true,
        },
    });

    return poll;
};

/**
 * Retrieves all polls with their options and vote counts.
 * Ordered by most recent first.
 *
 * @returns Array of polls with option vote counts
 */
export const getAllPolls = async (): Promise<PollWithDetails[]> => {
    const polls = await prisma.poll.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            options: {
                include: {
                    _count: { select: { votes: true } },
                    votes: {
                        include: {
                            user: { select: { id: true, name: true } },
                        },
                    },
                },
            },
            _count: { select: { votes: true } },
        },
    });

    return polls as PollWithDetails[];
};

/**
 * Casts a vote for a poll option.
 * Enforces one vote per user per poll via unique constraint.
 *
 * @param userId - UUID of the voting user
 * @param pollId - UUID of the poll
 * @param optionId - UUID of the chosen option
 * @returns The created vote record
 * @throws Error if user already voted or poll is closed
 */
export const castVote = async (
    userId: string,
    pollId: string,
    optionId: string
): Promise<PollVote> => {
    // Check poll exists and is active
    const poll = await prisma.poll.findUnique({ where: { id: pollId } });
    if (!poll) {
        throw new Error('Poll not found');
    }
    if (poll.status === 'CLOSED') {
        throw new Error('Poll is closed');
    }

    // Check option belongs to this poll
    const option = await prisma.pollOption.findUnique({ where: { id: optionId } });
    if (!option || option.pollId !== pollId) {
        throw new Error('Invalid option for this poll');
    }

    // Check if user already voted (unique constraint will also catch this)
    const existingVote = await prisma.pollVote.findUnique({
        where: { userId_pollId: { userId, pollId } },
    });
    if (existingVote) {
        throw new Error('You have already voted on this poll');
    }

    const vote = await prisma.pollVote.create({
        data: { userId, pollId, optionId },
    });

    return vote;
};

/**
 * Closes a poll so no more votes can be cast.
 *
 * @param pollId - UUID of the poll to close
 * @returns The updated poll
 */
export const closePoll = async (pollId: string): Promise<Poll> => {
    return prisma.poll.update({
        where: { id: pollId },
        data: { status: 'CLOSED' },
    });
};

/**
 * Checks if a specific user has voted on a specific poll.
 *
 * @param userId - UUID of the user
 * @param pollId - UUID of the poll
 * @returns The vote record or null
 */
export const getUserVote = async (
    userId: string,
    pollId: string
): Promise<PollVote | null> => {
    return prisma.pollVote.findUnique({
        where: { userId_pollId: { userId, pollId } },
    });
};
