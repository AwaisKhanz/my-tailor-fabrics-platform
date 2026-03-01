/*
  Warnings:

  - You are about to drop the `BranchGarmentPrice` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "BranchGarmentPrice" DROP CONSTRAINT "BranchGarmentPrice_branchId_fkey";

-- DropForeignKey
ALTER TABLE "BranchGarmentPrice" DROP CONSTRAINT "BranchGarmentPrice_garmentTypeId_fkey";

-- AlterTable
ALTER TABLE "GarmentType" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- DropTable
DROP TABLE "BranchGarmentPrice";

-- CreateTable
CREATE TABLE "GarmentPriceLog" (
    "id" TEXT NOT NULL,
    "garmentTypeId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "branchId" TEXT,
    "oldCustomerPrice" INTEGER,
    "oldEmployeeRate" INTEGER,
    "newCustomerPrice" INTEGER,
    "newEmployeeRate" INTEGER,
    "action" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GarmentPriceLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_GarmentTypeToMeasurementCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE INDEX "GarmentPriceLog_garmentTypeId_idx" ON "GarmentPriceLog"("garmentTypeId");

-- CreateIndex
CREATE INDEX "GarmentPriceLog_createdAt_idx" ON "GarmentPriceLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "_GarmentTypeToMeasurementCategory_AB_unique" ON "_GarmentTypeToMeasurementCategory"("A", "B");

-- CreateIndex
CREATE INDEX "_GarmentTypeToMeasurementCategory_B_index" ON "_GarmentTypeToMeasurementCategory"("B");

-- AddForeignKey
ALTER TABLE "GarmentPriceLog" ADD CONSTRAINT "GarmentPriceLog_garmentTypeId_fkey" FOREIGN KEY ("garmentTypeId") REFERENCES "GarmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarmentPriceLog" ADD CONSTRAINT "GarmentPriceLog_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GarmentPriceLog" ADD CONSTRAINT "GarmentPriceLog_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GarmentTypeToMeasurementCategory" ADD CONSTRAINT "_GarmentTypeToMeasurementCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "GarmentType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GarmentTypeToMeasurementCategory" ADD CONSTRAINT "_GarmentTypeToMeasurementCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "MeasurementCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
