import prisma from '../lib/prisma';
import { Faq, StaticContent } from '@prisma/client';

/**
 * Creates a new FAQ entry
 */
export const createFaq = async (question: string, answer: string, order: number = 0, organizationId?: string | null): Promise<Faq> => {
    return prisma.faq.create({
        data: { question, answer, order, organizationId: organizationId || null },
    });
};

/**
 * Gets all FAQs ordered by their defined order
 */
export const getAllFaqs = async (organizationId?: string | null): Promise<Faq[]> => {
    return prisma.faq.findMany({
        where: { organizationId: organizationId || null },
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
export const upsertStaticContent = async (type: string, title: string, content: string, organizationId?: string | null): Promise<StaticContent> => {
    const existing = await prisma.staticContent.findFirst({
        where: { type, organizationId: organizationId || null },
    });
    
    if (existing) {
        return prisma.staticContent.update({
            where: { id: existing.id },
            data: { title, content },
        });
    } else {
        return prisma.staticContent.create({
            data: { type, title, content, organizationId: organizationId || null },
        });
    }
};

/**
 * Gets a specific StaticContent by its type
 */
export const getStaticContent = async (type: string, organizationId?: string | null): Promise<StaticContent | null> => {
    return prisma.staticContent.findFirst({
        where: { type, organizationId: organizationId || null },
    });
};
