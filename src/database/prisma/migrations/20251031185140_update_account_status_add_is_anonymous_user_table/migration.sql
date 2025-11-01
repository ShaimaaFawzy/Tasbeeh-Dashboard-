/*
  Warnings:

  - The values [Offline] on the enum `AccountStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountStatus_new" AS ENUM ('Active', 'Suspended', 'Deleted');
ALTER TABLE "public"."users" ALTER COLUMN "accountStatus" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "accountStatus" TYPE "AccountStatus_new" USING ("accountStatus"::text::"AccountStatus_new");
ALTER TYPE "AccountStatus" RENAME TO "AccountStatus_old";
ALTER TYPE "AccountStatus_new" RENAME TO "AccountStatus";
DROP TYPE "public"."AccountStatus_old";
ALTER TABLE "users" ALTER COLUMN "accountStatus" SET DEFAULT 'Active';
COMMIT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isAnonymous" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "userName" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL;
