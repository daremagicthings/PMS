import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton.
 * Ensures a single database connection is reused across the application,
 * preventing connection pool exhaustion during development with hot-reloading.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma: PrismaClient = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
