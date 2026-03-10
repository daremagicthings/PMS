-- CreateEnum
CREATE TYPE "LeaseStatus" AS ENUM ('ACTIVE', 'CANCELED', 'AUTO_RENEW');

-- CreateEnum
CREATE TYPE "DocumentCategory" AS ENUM ('INCOMING', 'OUTGOING', 'LAW', 'RESOLUTION', 'RULE', 'CONTRACT', 'OTHER', 'ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "RatingValue" AS ENUM ('GOOD', 'AVERAGE', 'BAD');

-- AlterTable
ALTER TABLE "announcements" ADD COLUMN     "category" "DocumentCategory" NOT NULL DEFAULT 'ANNOUNCEMENT',
ADD COLUMN     "pdfUrl" TEXT;

-- AlterTable
ALTER TABLE "apartments" ADD COLUMN     "contractNumber" TEXT,
ADD COLUMN     "contractPdfUrl" TEXT,
ADD COLUMN     "leaseStatus" "LeaseStatus" NOT NULL DEFAULT 'ACTIVE';

-- CreateTable
CREATE TABLE "contract_history" (
    "id" TEXT NOT NULL,
    "contractNumber" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "status" "LeaseStatus" NOT NULL,
    "pdfUrl" TEXT,
    "apartmentId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hoa_ratings" (
    "id" TEXT NOT NULL,
    "rating" "RatingValue" NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hoa_ratings_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "contract_history" ADD CONSTRAINT "contract_history_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contract_history" ADD CONSTRAINT "contract_history_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoa_ratings" ADD CONSTRAINT "hoa_ratings_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoa_ratings" ADD CONSTRAINT "hoa_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hoa_ratings" ADD CONSTRAINT "hoa_ratings_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
