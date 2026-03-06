-- Lifecycle governance hardening: archive metadata + reversal tracking

ALTER TABLE "MeasurementSection"
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "MeasurementSection_categoryId_deletedAt_sortOrder_idx"
  ON "MeasurementSection"("categoryId", "deletedAt", "sortOrder");

ALTER TABLE "CustomerMeasurement"
  ADD COLUMN IF NOT EXISTS "valuesMeta" JSONB;

ALTER TABLE "OrderPayment"
  ADD COLUMN IF NOT EXISTS "reversedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reversedById" TEXT,
  ADD COLUMN IF NOT EXISTS "reversalNote" TEXT;

CREATE INDEX IF NOT EXISTS "OrderPayment_reversedAt_idx"
  ON "OrderPayment"("reversedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'OrderPayment_reversedById_fkey'
      AND table_name = 'OrderPayment'
  ) THEN
    ALTER TABLE "OrderPayment"
      ADD CONSTRAINT "OrderPayment_reversedById_fkey"
      FOREIGN KEY ("reversedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

ALTER TABLE "Payment"
  ADD COLUMN IF NOT EXISTS "reversedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reversedById" TEXT,
  ADD COLUMN IF NOT EXISTS "reversalNote" TEXT;

CREATE INDEX IF NOT EXISTS "Payment_reversedAt_idx"
  ON "Payment"("reversedAt");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'Payment_reversedById_fkey'
      AND table_name = 'Payment'
  ) THEN
    ALTER TABLE "Payment"
      ADD CONSTRAINT "Payment_reversedById_fkey"
      FOREIGN KEY ("reversedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

ALTER TABLE "EmployeeLedgerEntry"
  ADD COLUMN IF NOT EXISTS "reversedById" TEXT,
  ADD COLUMN IF NOT EXISTS "reversalOfId" TEXT,
  ADD COLUMN IF NOT EXISTS "reversalNote" TEXT,
  ADD COLUMN IF NOT EXISTS "reversedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "EmployeeLedgerEntry_reversedAt_idx"
  ON "EmployeeLedgerEntry"("reversedAt");

CREATE INDEX IF NOT EXISTS "EmployeeLedgerEntry_reversalOfId_idx"
  ON "EmployeeLedgerEntry"("reversalOfId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'EmployeeLedgerEntry_reversedById_fkey'
      AND table_name = 'EmployeeLedgerEntry'
  ) THEN
    ALTER TABLE "EmployeeLedgerEntry"
      ADD CONSTRAINT "EmployeeLedgerEntry_reversedById_fkey"
      FOREIGN KEY ("reversedById") REFERENCES "User"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'EmployeeLedgerEntry_reversalOfId_fkey'
      AND table_name = 'EmployeeLedgerEntry'
  ) THEN
    ALTER TABLE "EmployeeLedgerEntry"
      ADD CONSTRAINT "EmployeeLedgerEntry_reversalOfId_fkey"
      FOREIGN KEY ("reversalOfId") REFERENCES "EmployeeLedgerEntry"("id")
      ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END$$;
