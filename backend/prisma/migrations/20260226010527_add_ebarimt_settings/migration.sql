-- AlterTable
ALTER TABLE "users" ADD COLUMN     "ebarimtRegNo" TEXT,
ADD COLUMN     "ebarimtType" TEXT NOT NULL DEFAULT 'CITIZEN';
