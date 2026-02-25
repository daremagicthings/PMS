-- AlterTable
ALTER TABLE "apartments" ADD COLUMN     "contractId" TEXT,
ADD COLUMN     "leaseEndDate" TIMESTAMP(3),
ADD COLUMN     "leaseStartDate" TIMESTAMP(3),
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "tenantId" TEXT,
ADD COLUMN     "unitType" TEXT NOT NULL DEFAULT 'APARTMENT';
