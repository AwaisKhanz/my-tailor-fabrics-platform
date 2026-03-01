/*
  Warnings:

  - You are about to drop the column `branchId` on the `GarmentPriceLog` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "GarmentPriceLog" DROP CONSTRAINT "GarmentPriceLog_branchId_fkey";

-- AlterTable
ALTER TABLE "GarmentPriceLog" DROP COLUMN "branchId";
