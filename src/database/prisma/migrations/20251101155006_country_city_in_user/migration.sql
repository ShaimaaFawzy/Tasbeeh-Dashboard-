/*
  Warnings:

  - You are about to drop the column `region` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "region",
ADD COLUMN     "city" VARCHAR(50),
ADD COLUMN     "country" VARCHAR(50);
