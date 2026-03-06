DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'PaymentType'
      AND e.enumlabel = 'WEEKLY_FIXED'
  ) THEN
    ALTER TYPE "PaymentType" RENAME VALUE 'WEEKLY_FIXED' TO 'MONTHLY_FIXED';
  END IF;
END $$;

ALTER TABLE "Employee"
  ADD COLUMN IF NOT EXISTS "monthlySalary" INTEGER,
  ADD COLUMN IF NOT EXISTS "employmentEndDate" TIMESTAMP(3);

UPDATE "Employee"
SET "employmentEndDate" = COALESCE("employmentEndDate", "deletedAt", "updatedAt", NOW())
WHERE "status" = 'LEFT'
  AND "employmentEndDate" IS NULL;

CREATE TABLE IF NOT EXISTS "SalaryAccrual" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "periodYear" INTEGER NOT NULL,
  "periodMonth" INTEGER NOT NULL,
  "periodStart" TIMESTAMP(3) NOT NULL,
  "periodEnd" TIMESTAMP(3) NOT NULL,
  "daysInMonth" INTEGER NOT NULL,
  "eligibleDays" INTEGER NOT NULL,
  "amount" INTEGER NOT NULL,
  "ledgerEntryId" TEXT NOT NULL,
  "generatedById" TEXT,
  "source" TEXT NOT NULL DEFAULT 'MANUAL',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SalaryAccrual_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "SalaryAccrual_ledgerEntryId_key"
  ON "SalaryAccrual"("ledgerEntryId");

CREATE UNIQUE INDEX IF NOT EXISTS "SalaryAccrual_employeeId_periodYear_periodMonth_key"
  ON "SalaryAccrual"("employeeId", "periodYear", "periodMonth");

CREATE INDEX IF NOT EXISTS "SalaryAccrual_branchId_periodYear_periodMonth_idx"
  ON "SalaryAccrual"("branchId", "periodYear", "periodMonth");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SalaryAccrual_employeeId_fkey'
  ) THEN
    ALTER TABLE "SalaryAccrual"
      ADD CONSTRAINT "SalaryAccrual_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SalaryAccrual_branchId_fkey'
  ) THEN
    ALTER TABLE "SalaryAccrual"
      ADD CONSTRAINT "SalaryAccrual_branchId_fkey"
      FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SalaryAccrual_ledgerEntryId_fkey'
  ) THEN
    ALTER TABLE "SalaryAccrual"
      ADD CONSTRAINT "SalaryAccrual_ledgerEntryId_fkey"
      FOREIGN KEY ("ledgerEntryId") REFERENCES "EmployeeLedgerEntry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'SalaryAccrual_generatedById_fkey'
  ) THEN
    ALTER TABLE "SalaryAccrual"
      ADD CONSTRAINT "SalaryAccrual_generatedById_fkey"
      FOREIGN KEY ("generatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
