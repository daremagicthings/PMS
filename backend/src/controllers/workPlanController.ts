import { Request, Response, NextFunction } from 'express';
import {
    createWorkPlan,
    getAllWorkPlans,
    updateWorkPlan,
    deleteWorkPlan,
    CreateWorkPlanInput,
    UpdateWorkPlanInput,
} from '../services/workPlanService';

/**
 * Controller for POST /api/work-plans
 * Admin creates a new work plan (with optional image upload).
 */
export const createWorkPlanController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { title, description, status, expectedDate } = req.body;

        if (!title || !description || !expectedDate) {
            res.status(400).json({
                success: false,
                message: 'title, description, and expectedDate are required',
            });
            return;
        }

        // Build imageUrl from uploaded file (multer)
        const file = req.file;
        const imageUrl = file ? `/uploads/${file.filename}` : undefined;

        const input: CreateWorkPlanInput = {
            title,
            description,
            status,
            expectedDate,
            imageUrl,
        };

        const workPlan = await createWorkPlan(input);

        res.status(201).json({
            success: true,
            message: 'Work plan created successfully',
            data: workPlan,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        next(err);
    }
};

/**
 * Controller for GET /api/work-plans
 * Lists all work plans.
 */
export const getAllWorkPlansController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const workPlans = await getAllWorkPlans();

        res.status(200).json({
            success: true,
            message: 'Work plans retrieved successfully',
            data: workPlans,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/work-plans/:id
 * Admin updates an existing work plan (with optional image upload).
 */
export const updateWorkPlanController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const { title, description, status, expectedDate } = req.body;

        // Build imageUrl from uploaded file (multer)
        const file = req.file;
        const imageUrl = file ? `/uploads/${file.filename}` : undefined;

        const input: UpdateWorkPlanInput = {
            ...(title !== undefined && { title }),
            ...(description !== undefined && { description }),
            ...(status !== undefined && { status }),
            ...(expectedDate !== undefined && { expectedDate }),
            ...(imageUrl !== undefined && { imageUrl }),
        };

        const workPlan = await updateWorkPlan(id, input);

        res.json({
            success: true,
            message: 'Work plan updated successfully',
            data: workPlan,
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
 * Controller for DELETE /api/work-plans/:id
 * Admin deletes a work plan.
 */
export const deleteWorkPlanController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await deleteWorkPlan(id);

        res.json({
            success: true,
            message: 'Work plan deleted successfully',
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
