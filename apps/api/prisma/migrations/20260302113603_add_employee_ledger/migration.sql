-- CreateEnum
CREATE TYPE "LedgerEntryType" AS ENUM ('EARNING', 'PAYOUT', 'ADVANCE', 'DEDUCTION', 'ADJUSTMENT', 'SALARY');

-- CreateTable
CREATE TABLE "EmployeeLedgerEntry" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "branchId" TEXT NOT NULL,
    "type" "LedgerEntryType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "orderItemTaskId" TEXT,
    "createdById" TEXT,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "EmployeeLedgerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmployeeLedgerEntry_employeeId_createdAt_idx" ON "EmployeeLedgerEntry"("employeeId", "createdAt");

-- CreateIndex
CREATE INDEX "EmployeeLedgerEntry_branchId_createdAt_idx" ON "EmployeeLedgerEntry"("branchId", "createdAt");

-- CreateIndex
CREATE INDEX "EmployeeLedgerEntry_orderItemTaskId_idx" ON "EmployeeLedgerEntry"("orderItemTaskId");

-- AddForeignKey
ALTER TABLE "EmployeeLedgerEntry" ADD CONSTRAINT "EmployeeLedgerEntry_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLedgerEntry" ADD CONSTRAINT "EmployeeLedgerEntry_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLedgerEntry" ADD CONSTRAINT "EmployeeLedgerEntry_orderItemTaskId_fkey" FOREIGN KEY ("orderItemTaskId") REFERENCES "OrderItemTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeLedgerEntry" ADD CONSTRAINT "EmployeeLedgerEntry_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
