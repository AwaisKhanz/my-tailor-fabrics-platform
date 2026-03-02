/*
  Warnings:

  - A unique constraint covering the columns `[orderId,garmentTypeId,pieceNo]` on the table `OrderItem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "FabricSource" AS ENUM ('SHOP', 'CUSTOMER');

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "fabricSource" "FabricSource" NOT NULL DEFAULT 'SHOP',
ADD COLUMN     "pieceNo" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE UNIQUE INDEX "OrderItem_orderId_garmentTypeId_pieceNo_key" ON "OrderItem"("orderId", "garmentTypeId", "pieceNo");
