-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "designTypeId" TEXT;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_designTypeId_fkey" FOREIGN KEY ("designTypeId") REFERENCES "DesignType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
