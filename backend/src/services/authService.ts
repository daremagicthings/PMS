import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma';
import { Role } from '@prisma/client';

/** JWT secret — in production, use a proper env variable */
const JWT_SECRET = process.env.JWT_SECRET || 'soh-dev-secret-key';

/** JWT expiration time */
const JWT_EXPIRES_IN = '7d';

/** Payload embedded in the JWT token */
export interface JwtPayload {
    userId: string;
    role: Role;
}

/** Shape of the login request body */
export interface LoginInput {
    phone: string;
    password: string;
}

/** Shape of the login response data */
export interface LoginResult {
    token: string;
    user: {
        id: string;
        name: string;
        phone: string | null;
        email: string | null;
        role: Role;
        apartmentId: string | null;
    };
}

/**
 * Authenticates a user by phone number and password.
 * Returns a JWT token on success.
 *
 * @param input - The login credentials (phone + password)
 * @returns JWT token and user info
 * @throws Error if user not found or password invalid
 */
export const login = async (input: LoginInput): Promise<LoginResult> => {
    const { phone, password } = input;

    const user = await prisma.user.findUnique({
        where: { phone },
    });

    if (!user) {
        throw new Error('Invalid phone number or password');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
        throw new Error('Invalid phone number or password');
    }

    const payload: JwtPayload & { organizationId: string | null } = {
        userId: user.id,
        role: user.role,
        organizationId: user.organizationId,
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            phone: user.phone,
            email: user.email,
            role: user.role,
            apartmentId: user.apartmentId,
        },
    };
};

/**
 * Hashes a plain-text password using bcrypt.
 * Exported for use in user registration.
 *
 * @param password - Plain text password
 * @returns Hashed password string
 */
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

/** Shape of the change password request body */
export interface ChangePasswordInput {
    oldPassword: string;
    newPassword: string;
}

/**
 * Changes a user's password after verifying the old password.
 * Constitution: Financial-grade security — always verify before changing.
 *
 * @param userId - UUID of the authenticated user
 * @param input - Old and new password
 * @returns Success message
 * @throws Error if user not found or old password invalid
 */
export const changePassword = async (
    userId: string,
    input: ChangePasswordInput
): Promise<{ message: string }> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error('User not found');
    }

    const validOldPassword = await bcrypt.compare(input.oldPassword, user.passwordHash);
    if (!validOldPassword) {
        throw new Error('Current password is incorrect');
    }

    if (input.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters');
    }

    const newHash = await hashPassword(input.newPassword);

    await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newHash },
    });

    return { message: 'Password changed successfully' };
};

