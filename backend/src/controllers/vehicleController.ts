import { Request, Response, NextFunction } from 'express';
import {
    createVehicle,
    getAllVehicles,
    updateVehicle,
    deleteVehicle,
    CreateVehicleInput,
    UpdateVehicleInput,
} from '../services/vehicleService';

/**
 * Controller for POST /api/vehicles
 * Admin creates a new vehicle record.
 */
export const createVehicleController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const input = req.body as CreateVehicleInput;

        if (!input.licensePlate || !input.makeModel || !input.apartmentId) {
            res.status(400).json({
                success: false,
                message: 'licensePlate, makeModel, and apartmentId are required',
            });
            return;
        }

        const vehicle = await createVehicle(input);

        res.status(201).json({
            success: true,
            message: 'Vehicle created successfully',
            data: vehicle,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('not found')) {
            res.status(404).json({ success: false, message: err.message });
            return;
        }
        if (err.message.includes('Unique constraint')) {
            res.status(409).json({ success: false, message: 'License plate already registered' });
            return;
        }
        next(err);
    }
};

/**
 * Controller for GET /api/vehicles
 * Lists all vehicles with optional license plate search.
 */
export const getAllVehiclesController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const search = req.query.search as string | undefined;
        const vehicles = await getAllVehicles(search);

        res.status(200).json({
            success: true,
            message: 'Vehicles retrieved successfully',
            data: vehicles,
        });
    } catch (error) {
        next(error instanceof Error ? error : new Error('Unknown error'));
    }
};

/**
 * Controller for PUT /api/vehicles/:id
 * Admin updates an existing vehicle.
 */
export const updateVehicleController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        const input = req.body as UpdateVehicleInput;

        if (!id) {
            res.status(400).json({ success: false, message: 'Vehicle ID is required' });
            return;
        }

        const vehicle = await updateVehicle(id, input);

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            data: vehicle,
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('Record to update not found')) {
            res.status(404).json({ success: false, message: 'Vehicle not found' });
            return;
        }
        next(err);
    }
};

/**
 * Controller for DELETE /api/vehicles/:id
 * Admin deletes a vehicle record.
 */
export const deleteVehicleController = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const id = req.params.id as string;
        await deleteVehicle(id);

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully',
        });
    } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        if (err.message.includes('Record to delete does not exist')) {
            res.status(404).json({ success: false, message: 'Vehicle not found' });
            return;
        }
        next(err);
    }
};
