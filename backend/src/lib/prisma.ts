import { PrismaClient } from '@prisma/client';
import { tenantContext } from './tenantContext';

/**
 * Prisma Client singleton.
 * Ensures a single database connection is reused across the application,
 * preventing connection pool exhaustion during development with hot-reloading.
 */

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

const basePrisma = new PrismaClient();

// Tenant models that have organizationId
const TENANT_MODELS = [
  'User',
  'Apartment',
  'Announcement',
  'WorkPlan',
  'FinancialReport',
  'Poll',
  'StaticContent',
  'Contact',
  'Faq',
  'ContractHistory',
  'HOARating'
];

export const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const ctx = tenantContext.getStore();

        // If no context, or user is SUPER_ADMIN, or model is not tenant-aware, proceed normally
        if (!ctx || ctx.role === 'SUPER_ADMIN' || !TENANT_MODELS.includes(model as string)) {
          return query(args);
        }

        const a = args as any;
        const organizationId = ctx.organizationId;
        if (!organizationId) {
          // If a non-SUPER_ADMIN user has no organization, they shouldn't see any tenant data
          if (['findMany', 'findFirst', 'findUnique', 'count', 'update', 'updateMany', 'delete', 'deleteMany'].includes(operation)) {
            a.where = { ...a.where, organizationId: 'NO_ORG_ACCESS' };
          }
          return query(a);
        }

        // Inject organizationId into where clause for read/update/delete
        if (['findMany', 'findFirst', 'count', 'updateMany', 'deleteMany'].includes(operation)) {
          a.where = { ...a.where, organizationId };
        } else if (['findUnique', 'update', 'delete'].includes(operation)) {
          if (operation === 'findUnique') {
            const findFirstArgs = { ...a, where: { ...a.where, organizationId } };
            return (basePrisma as any)[model].findFirst(findFirstArgs);
          }
        }

        return query(a);
      },
    },
  },
}) as unknown as PrismaClient; // Cast to bypass strict extension typing issues

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;


