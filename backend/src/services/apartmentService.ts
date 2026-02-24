import prisma from '../lib/prisma';
import { Apartment } from '@prisma/client';

/** Shape of the create apartment request body */
export interface CreateApartmentInput {
    buildingName: string;
    entrance: string;
    floor: number;
    unitNumber: string;
}

/**
 * Creates a new apartment unit.
 *
 * @param input - Apartment details
 * @returns The newly created apartment record
 */
export const createApartment = async (input: CreateApartmentInput): Promise<Apartment> => {
    const apartment = await prisma.apartment.create({
        data: {
            buildingName: input.buildingName,
            entrance: input.entrance,
            floor: input.floor,
            unitNumber: input.unitNumber,
        },
    });

    return apartment;
};

/**
 * Retrieves all apartments with their linked residents.
 *
 * @returns Array of apartments with resident data
 */
export const getAllApartments = async (): Promise<Apartment[]> => {
    const apartments = await prisma.apartment.findMany({
        include: {
            residents: {
                select: {
                    id: true,
                    name: true,
                    phone: true,
                    email: true,
                    role: true,
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    });

    return apartments;
};
