import { Request, Response, NextFunction } from 'express';
import {
    createApartment,
    getAllApartments,
    updateApartment,
    CreateApartmentInput,
    UpdateApartmentInput,
} from '../services/apartmentService';

/**
 * Controller for POST /api/apartments
 * Creates a new apartment/unit with optional lease fields.
 */
export const createApartmentController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = req.body as CreateApartmentInput;

        if (!input.buildingName || !input.entrance || input.floor === undefined || !input.unitNumber) {
            res.status(400).json({
                success: false,
                message: 'buildingName, entrance, floor, and unitNumber are required',
            });
            return;
        }

        const apartment = await createApartment(input);

        res.status(201).json({
            success: true,
            message: 'Apartment created successfully',
            data: apartment,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/apartments/:id
 * Updates an existing apartment/unit (lease details, owner/tenant, etc).
 */
export const updateApartmentController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const input = req.body as UpdateApartmentInput;

        if (!id) {
            res.status(400).json({ success: false, message: 'Apartment ID is required' });
            return;
        }

        const apartment = await updateApartment(id, input);

        res.status(200).json({
            success: true,
            message: 'Apartment updated successfully',
            data: apartment,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for GET /api/apartments
 * Lists all apartments with connected residents.
 */
export const getAllApartmentsController = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const apartments = await getAllApartments();

        res.status(200).json({
            success: true,
            message: 'Apartments retrieved successfully',
            data: apartments,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};
