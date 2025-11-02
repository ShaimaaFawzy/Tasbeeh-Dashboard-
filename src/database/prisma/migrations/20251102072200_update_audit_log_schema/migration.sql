/*
  Warnings:

  - You are about to drop the column `os` on the `audit_logs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "os",
ADD COLUMN     "adminEmail" VARCHAR(250),
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "details" TEXT,
ADD COLUMN     "resourceId" VARCHAR(50),
ADD COLUMN     "resourceType" VARCHAR(50),
ADD COLUMN     "userAgent" VARCHAR(500),
ALTER COLUMN "ipAddress" SET DATA TYPE VARCHAR(45),
ALTER COLUMN "status" SET DATA TYPE VARCHAR(20);
