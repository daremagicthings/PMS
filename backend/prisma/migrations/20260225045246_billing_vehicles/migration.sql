-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "penaltyAmount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "work_plans" ADD COLUMN     "category" TEXT NOT NULL DEFAULT 'REGULAR';

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "licensePlate" TEXT NOT NULL,
    "makeModel" TEXT NOT NULL,
    "apartmentId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_licensePlate_key" ON "vehicles"("licensePlate");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
