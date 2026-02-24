import prisma from '../lib/prisma';
import type { WorkPlan, WorkPlanStatus } from '@prisma/client';

/** Shape of the create work-plan request body */
export interface CreateWorkPlanInput {
    title: string;
    description: string;
    status?: WorkPlanStatus;
    expectedDate: string; // ISO date string
    imageUrl?: string;
}

/** Shape of the update work-plan request body */
export interface UpdateWorkPlanInput {
    title?: string;
    description?: string;
    status?: WorkPlanStatus;
    expectedDate?: string;
    imageUrl?: string;
}

/**
 * Creates a new work plan entry.
 *
 * @param input - Work plan details
 * @returns The newly created work plan
 */
export const createWorkPlan = async (input: CreateWorkPlanInput): Promise<WorkPlan> => {
    return prisma.workPlan.create({
        data: {
            title: input.title,
            description: input.description,
            status: input.status || 'PLANNED',
            expectedDate: new Date(input.expectedDate),
            imageUrl: input.imageUrl || null,
        },
    });
};

/**
 * Retrieves all work plans, newest first.
 *
 * @returns Array of work plans
 */
export const getAllWorkPlans = async (): Promise<WorkPlan[]> => {
    return prisma.workPlan.findMany({
        orderBy: { createdAt: 'desc' },
    });
};

/**
 * Updates an existing work plan by ID.
 *
 * @param id - Work plan UUID
 * @param input - Fields to update
 * @returns The updated work plan
 */
export const updateWorkPlan = async (id: string, input: UpdateWorkPlanInput): Promise<WorkPlan> => {
    const existing = await prisma.workPlan.findUnique({ where: { id } });
    if (!existing) throw new Error(`WorkPlan with ID ${id} not found`);

    return prisma.workPlan.update({
        where: { id },
        data: {
            ...(input.title !== undefined && { title: input.title }),
            ...(input.description !== undefined && { description: input.description }),
            ...(input.status !== undefined && { status: input.status }),
            ...(input.expectedDate !== undefined && { expectedDate: new Date(input.expectedDate) }),
            ...(input.imageUrl !== undefined && { imageUrl: input.imageUrl }),
        },
    });
};

/**
 * Deletes a work plan by ID.
 *
 * @param id - Work plan UUID
 * @returns The deleted work plan
 */
export const deleteWorkPlan = async (id: string): Promise<WorkPlan> => {
    const existing = await prisma.workPlan.findUnique({ where: { id } });
    if (!existing) throw new Error(`WorkPlan with ID ${id} not found`);

    return prisma.workPlan.delete({ where: { id } });
};
