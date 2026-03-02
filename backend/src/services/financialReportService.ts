import prisma from '../lib/prisma';
import type { FinancialReport } from '@prisma/client';

/** Shape of the create financial report request body */
export interface CreateFinancialReportInput {
    month: number;
    year: number;
    totalIncome: number;
    totalExpense: number;
    description?: string;
    imageUrl?: string;
}

/** Shape of the update financial report request body */
export interface UpdateFinancialReportInput {
    month?: number;
    year?: number;
    totalIncome?: number;
    totalExpense?: number;
    description?: string;
    imageUrl?: string;
}

/**
 * Creates a new financial report entry.
 *
 * @param input - Financial report details
 * @returns The newly created financial report
 */
export const createFinancialReport = async (input: CreateFinancialReportInput): Promise<FinancialReport> => {
    return prisma.financialReport.create({
        data: {
            month: input.month,
            year: input.year,
            totalIncome: input.totalIncome,
            totalExpense: input.totalExpense,
            description: input.description || null,
            imageUrl: input.imageUrl || null,
        },
    });
};

/**
 * Retrieves all financial reports, newest first (by year desc, then month desc).
 *
 * @returns Array of financial reports
 */
export const getAllFinancialReports = async (): Promise<FinancialReport[]> => {
    return prisma.financialReport.findMany({
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
};

/**
 * Retrieves a single financial report by ID, including its associated transactions.
 */
export const getFinancialReportById = async (id: string) => {
    return prisma.financialReport.findUnique({
        where: { id },
        include: { transactions: { orderBy: { date: 'asc' } } }
    });
};

/**
 * Updates an existing financial report by ID.
 *
 * @param id - Financial report UUID
 * @param input - Fields to update
 * @returns The updated financial report
 */
export const updateFinancialReport = async (
    id: string,
    input: UpdateFinancialReportInput
): Promise<FinancialReport> => {
    const existing = await prisma.financialReport.findUnique({ where: { id } });
    if (!existing) throw new Error(`FinancialReport with ID ${id} not found`);

    return prisma.financialReport.update({
        where: { id },
        data: {
            ...(input.month !== undefined && { month: input.month }),
            ...(input.year !== undefined && { year: input.year }),
            ...(input.totalIncome !== undefined && { totalIncome: input.totalIncome }),
            ...(input.totalExpense !== undefined && { totalExpense: input.totalExpense }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        },
    });
};

/**
 * Deletes a financial report by ID.
 *
 * @param id - Financial report UUID
 * @returns The deleted financial report
 */
export const deleteFinancialReport = async (id: string): Promise<FinancialReport> => {
    const existing = await prisma.financialReport.findUnique({ where: { id } });
    if (!existing) throw new Error(`FinancialReport with ID ${id} not found`);

    return prisma.financialReport.delete({ where: { id } });
};
