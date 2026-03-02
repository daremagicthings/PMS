import prisma from '../lib/prisma';
import { Vehicle } from '@prisma/client';

/** Shape of the create vehicle request body */
export interface CreateVehicleInput {
    licensePlate: string;
    makeModel: string;
    apartmentId: string;
}

/** Shape of the update vehicle request body */
export interface UpdateVehicleInput {
    licensePlate?: string;
    makeModel?: string;
    apartmentId?: string;
}

/**
 * Creates a new vehicle linked to an apartment.
 * Constitution: license plates are unique — enforced at DB level.
 */
export const createVehicle = async (input: CreateVehicleInput): Promise<Vehicle> => {
    const apartment = await prisma.apartment.findUnique({
        where: { id: input.apartmentId },
    });

    if (!apartment) {
        throw new Error(`Apartment with ID ${input.apartmentId} not found`);
    }

    const vehicle = await prisma.vehicle.create({
        data: {
            licensePlate: input.licensePlate.toUpperCase().trim(),
            makeModel: input.makeModel,
            apartmentId: input.apartmentId,
        },
        include: {
            apartment: {
                select: { id: true, buildingName: true, unitNumber: true, entrance: true },
            },
        },
    });

    return vehicle;
};

/**
 * Retrieves all vehicles with apartment info.
 * Supports optional search by license plate.
 */
export const getAllVehicles = async (search?: string): Promise<Vehicle[]> => {
    const vehicles = await prisma.vehicle.findMany({
        where: search
            ? { licensePlate: { contains: search.toUpperCase(), mode: 'insensitive' } }
            : undefined,
        include: {
            apartment: {
                select: { id: true, buildingName: true, unitNumber: true, entrance: true },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return vehicles;
};

/**
 * Updates an existing vehicle.
 */
export const updateVehicle = async (id: string, input: UpdateVehicleInput): Promise<Vehicle> => {
    const data: Record<string, unknown> = {};

    if (input.licensePlate !== undefined) data.licensePlate = input.licensePlate.toUpperCase().trim();
    if (input.makeModel !== undefined) data.makeModel = input.makeModel;
    if (input.apartmentId !== undefined) data.apartmentId = input.apartmentId;

    const vehicle = await prisma.vehicle.update({
        where: { id },
        data,
        include: {
            apartment: {
                select: { id: true, buildingName: true, unitNumber: true, entrance: true },
            },
        },
    });

    return vehicle;
};

/**
 * Deletes a vehicle by ID.
 */
export const deleteVehicle = async (id: string): Promise<Vehicle> => {
    return prisma.vehicle.delete({ where: { id } });
};
