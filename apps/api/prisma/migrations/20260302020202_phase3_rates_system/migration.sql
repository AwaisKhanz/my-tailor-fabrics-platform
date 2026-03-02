-- AlterTable
ALTER TABLE "OrderItemTask" ADD COLUMN     "rateCardId" TEXT,
ADD COLUMN     "rateOverride" INTEGER,
ADD COLUMN     "rateSnapshot" INTEGER;

-- CreateTable
CREATE TABLE "RateCard" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "garmentTypeId" TEXT NOT NULL,
    "stepTemplateId" TEXT,
    "stepKey" TEXT NOT NULL,
    "rate" INTEGER NOT NULL,
    "effectiveFrom" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "effectiveTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "RateCard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RateCard_branchId_garmentTypeId_stepKey_idx" ON "RateCard"("branchId", "garmentTypeId", "stepKey");

-- CreateIndex
CREATE INDEX "RateCard_effectiveFrom_effectiveTo_idx" ON "RateCard"("effectiveFrom", "effectiveTo");

-- CreateIndex
CREATE INDEX "OrderItem_garmentTypeId_idx" ON "OrderItem"("garmentTypeId");

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_garmentTypeId_fkey" FOREIGN KEY ("garmentTypeId") REFERENCES "GarmentType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_stepTemplateId_fkey" FOREIGN KEY ("stepTemplateId") REFERENCES "WorkflowStepTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemTask" ADD CONSTRAINT "OrderItemTask_rateCardId_fkey" FOREIGN KEY ("rateCardId") REFERENCES "RateCard"("id") ON DELETE SET NULL ON UPDATE CASCADE;
