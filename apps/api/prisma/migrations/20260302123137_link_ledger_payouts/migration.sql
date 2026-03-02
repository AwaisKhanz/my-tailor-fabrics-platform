-- AlterTable
ALTER TABLE "EmployeeLedgerEntry" ADD COLUMN     "paymentId" TEXT;

-- AddForeignKey
ALTER TABLE "EmployeeLedgerEntry" ADD CONSTRAINT "EmployeeLedgerEntry_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
