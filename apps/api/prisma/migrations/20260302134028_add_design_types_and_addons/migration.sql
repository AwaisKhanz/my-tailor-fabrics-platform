-- CreateEnum
CREATE TYPE "AddonType" AS ENUM ('EXTRA', 'ALTERATION', 'DESIGN_CHARGE');

-- AlterTable
ALTER TABLE "OrderItemTask" ADD COLUMN     "designTypeId" TEXT;

-- CreateTable
CREATE TABLE "DesignType" (
    "id" TEXT NOT NULL,
    "branchId" TEXT,
    "garmentTypeId" TEXT,
    "name" TEXT NOT NULL,
    "defaultPrice" INTEGER NOT NULL,
    "defaultRate" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "DesignType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItemAddon" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT NOT NULL,
    "type" "AddonType" NOT NULL DEFAULT 'EXTRA',
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "cost" INTEGER,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "OrderItemAddon_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DesignType_branchId_garmentTypeId_idx" ON "DesignType"("branchId", "garmentTypeId");

-- CreateIndex
CREATE INDEX "OrderItemAddon_orderItemId_idx" ON "OrderItemAddon"("orderItemId");

-- AddForeignKey
ALTER TABLE "OrderItemTask" ADD CONSTRAINT "OrderItemTask_designTypeId_fkey" FOREIGN KEY ("designTypeId") REFERENCES "DesignType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignType" ADD CONSTRAINT "DesignType_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DesignType" ADD CONSTRAINT "DesignType_garmentTypeId_fkey" FOREIGN KEY ("garmentTypeId") REFERENCES "GarmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemAddon" ADD CONSTRAINT "OrderItemAddon_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
