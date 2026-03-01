/*
  Warnings:

  - You are about to drop the column `pickupDiscount` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `rushCapability` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `taxInclusive` on the `Branch` table. All the data in the column will be lost.
  - You are about to drop the column `taxRate` on the `Branch` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Branch" DROP COLUMN "pickupDiscount",
DROP COLUMN "rushCapability",
DROP COLUMN "taxInclusive",
DROP COLUMN "taxRate";
