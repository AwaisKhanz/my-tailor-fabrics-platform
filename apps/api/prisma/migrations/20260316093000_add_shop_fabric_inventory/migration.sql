-- AlterTable
ALTER TABLE "OrderItem"
ADD COLUMN "shopFabricId" TEXT,
ADD COLUMN "shopFabricPriceSnapshot" INTEGER,
ADD COLUMN "shopFabricTotalSnapshot" INTEGER,
ADD COLUMN "shopFabricNameSnapshot" TEXT,
ADD COLUMN "customerFabricNote" TEXT;

-- CreateTable
CREATE TABLE "ShopFabric" (
    "id" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "code" TEXT,
    "sellingRate" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "ShopFabric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderItem_shopFabricId_idx" ON "OrderItem"("shopFabricId");

-- CreateIndex
CREATE INDEX "ShopFabric_branchId_isActive_deletedAt_idx" ON "ShopFabric"("branchId", "isActive", "deletedAt");

-- CreateIndex
CREATE INDEX "ShopFabric_branchId_name_idx" ON "ShopFabric"("branchId", "name");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_shopFabricId_fkey" FOREIGN KEY ("shopFabricId") REFERENCES "ShopFabric"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShopFabric" ADD CONSTRAINT "ShopFabric_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
