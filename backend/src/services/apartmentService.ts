import prisma from '../lib/prisma';
import { Apartment } from '@prisma/client';

/** Shape of the create apartment request body */
export interface CreateApartmentInput {
    buildingName: string;
    entrance: string;
    floor: number;
    unitNumber: string;
    unitType?: string;
    ownerId?: string;
    tenantId?: string;
    leaseStartDate?: string | Date;
    leaseEndDate?: string | Date;
    contractId?: string;
}

/** Shape of the update apartment request body */
export interface UpdateApartmentInput {
    buildingName?: string;
    entrance?: string;
    floor?: number;
    unitNumber?: string;
    unitType?: string;
    ownerId?: string | null;
    tenantId?: string | null;
    leaseStartDate?: string | Date | null;
    leaseEndDate?: string | Date | null;
    contractId?: string | null;
}

/**
 * Creates a new apartment/unit.
 *
 * @param input - Apartment details including optional lease fields
 * @returns The newly created apartment record
 */
export const createApartment = async (input: CreateApartmentInput): Promise<Apartment> => {
    const apartment = await prisma.apartment.create({
        data: {
            buildingName: input.buildingName,
            entrance: input.entrance,
            floor: input.floor,
            unitNumber: input.unitNumber,
            unitType: input.unitType ?? 'APARTMENT',
            ownerId: input.ownerId ?? null,
            tenantId: input.tenantId ?? null,
            leaseStartDate: input.leaseStartDate ? new Date(input.leaseStartDate) : null,
            leaseEndDate: input.leaseEndDate ? new Date(input.leaseEndDate) : null,
            contractId: input.contractId ?? null,
        },
    });

    return apartment;
};

/**
 * Updates an existing apartment/unit.
 *
 * @param id - Apartment UUID
 * @param input - Fields to update (all optional)
 * @returns The updated apartment record
 */
export const updateApartment = async (id: string, input: UpdateApartmentInput): Promise<Apartment> => {
    const data: Record<string, unknown> = {};

    if (input.buildingName !== undefined) data.buildingName = input.buildingName;
    if (input.entrance !== undefined) data.entrance = input.entrance;
    if (input.floor !== undefined) data.floor = input.floor;
    if (input.unitNumber !== undefined) data.unitNumber = input.unitNumber;
    if (input.unitType !== undefined) data.unitType = input.unitType;
    if (input.ownerId !== undefined) data.ownerId = input.ownerId;
    if (input.tenantId !== undefined) data.tenantId = input.tenantId;
    if (input.leaseStartDate !== undefined) {
        data.leaseStartDate = input.leaseStartDate ? new Date(input.leaseStartDate) : null;
    }
    if (input.leaseEndDate !== undefined) {
        data.leaseEndDate = input.leaseEndDate ? new Date(input.leaseEndDate) : null;
    }
    if (input.contractId !== undefined) data.contractId = input.contractId;

    const apartment = await prisma.apartment.update({
        where: { id },
        data,
        include: {
            residents: {
                select: { id: true, name: true, phone: true, email: true, role: true },
            },
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

/**
 * Retrieves all apartments linked to a specific user (either as a resident, owner, or tenant).
 *
 * @param userId - ID of the user
 * @returns Array of apartments linked to the user
 */
export const getMyApartments = async (userId: string): Promise<Apartment[]> => {
    const apartments = await prisma.apartment.findMany({
        where: {
            OR: [
                { residents: { some: { id: userId } } }, // Legacy/resident approach
                { ownerId: userId },                     // Explicit owner
                { tenantId: userId },                    // Explicit tenant
            ],
        },
        orderBy: { buildingName: 'asc', unitNumber: 'asc' },
    });

    return apartments;
};
