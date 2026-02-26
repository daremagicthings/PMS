import prisma from '../lib/prisma';
import { User, Role } from '@prisma/client';
import { hashPassword } from './authService';

/** Shape of the create user request body */
export interface CreateUserInput {
    name: string;
    phone: string;
    email?: string;
    password: string;
    role?: Role;
    apartmentId?: string;
}

/** User data returned to the client (excludes passwordHash) */
export interface SafeUser {
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    role: Role;
    apartmentId: string | null;
    ebarimtType: string;
    ebarimtRegNo: string | null;
    createdAt: Date;
    updatedAt: Date;
}

/**
 * Creates a new user/resident and optionally links them to an apartment.
 *
 * @param input - User registration data
 * @returns The created user (without passwordHash)
 */
export const createUser = async (input: CreateUserInput): Promise<SafeUser> => {
    const hashedPassword = await hashPassword(input.password);

    const user: User = await prisma.user.create({
        data: {
            name: input.name,
            phone: input.phone,
            email: input.email || null,
            passwordHash: hashedPassword,
            role: input.role || 'RESIDENT',
            apartmentId: input.apartmentId || null,
        },
    });

    return toSafeUser(user);
};

/**
 * Retrieves all users (Admin only in the future).
 *
 * @returns Array of users without password hashes
 */
export const getAllUsers = async (): Promise<SafeUser[]> => {
    const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return users.map(toSafeUser);
};

/**
 * Strips passwordHash from a User record before returning to clients.
 *
 * @param user - Full Prisma User record
 * @returns User object without the passwordHash field
 */
const toSafeUser = (user: User): SafeUser => {
    return {
        id: user.id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        apartmentId: user.apartmentId,
        ebarimtType: user.ebarimtType,
        ebarimtRegNo: user.ebarimtRegNo,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
};

/**
 * Updates the Expo push notification token for a user.
 *
 * @param userId - UUID of the user
 * @param token - Expo push token string
 */
export const updatePushToken = async (userId: string, token: string): Promise<void> => {
    await prisma.user.update({
        where: { id: userId },
        data: { expoPushToken: token },
    });
};

/**
 * Updates the E-Barimt settings (Type and Registry Number) for a user.
 *
 * @param userId - UUID of the user
 * @param ebarimtType - "CITIZEN" or "ENTITY"
 * @param ebarimtRegNo - Company TTDD or Citizen ID
 * @returns The updated safe user object
 */
export const updateEbarimtSettings = async (
    userId: string,
    ebarimtType: string,
    ebarimtRegNo: string | null
): Promise<SafeUser> => {
    const user = await prisma.user.update({
        where: { id: userId },
        data: {
            ebarimtType,
            ebarimtRegNo,
        },
    });

    return toSafeUser(user);
};

