import prisma from '../lib/prisma';
import { Faq, StaticContent } from '@prisma/client';

/**
 * Creates a new FAQ entry
 */
export const createFaq = async (question: string, answer: string, order: number = 0): Promise<Faq> => {
    return prisma.faq.create({
        data: { question, answer, order },
    });
};

/**
 * Gets all FAQs ordered by their defined order
 */
export const getAllFaqs = async (): Promise<Faq[]> => {
    return prisma.faq.findMany({
        orderBy: { order: 'asc' },
    });
};

/**
 * Updates an existing FAQ
 */
export const updateFaq = async (id: string, question?: string, answer?: string, order?: number): Promise<Faq> => {
    return prisma.faq.update({
        where: { id },
        data: {
            ...(question && { question }),
            ...(answer && { answer }),
            ...(order !== undefined && { order }),
        },
    });
};

/**
 * Deletes an FAQ
 */
export const deleteFaq = async (id: string): Promise<Faq> => {
    return prisma.faq.delete({
        where: { id },
    });
};

/**
 * Upserts a StaticContent entry (creates if doesn't exist, updates if it does)
 */
export const upsertStaticContent = async (type: string, title: string, content: string): Promise<StaticContent> => {
    return prisma.staticContent.upsert({
        where: { type },
        update: { title, content },
        create: { type, title, content },
    });
};

/**
 * Gets a specific StaticContent by its type
 */
export const getStaticContent = async (type: string): Promise<StaticContent | null> => {
    return prisma.staticContent.findUnique({
        where: { type },
    });
};
