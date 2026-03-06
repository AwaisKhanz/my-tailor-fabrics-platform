CREATE TABLE IF NOT EXISTS "EmployeeCapability" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "garmentTypeId" TEXT,
  "stepKey" TEXT,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "note" TEXT,
  "createdById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "deletedAt" TIMESTAMP(3),
  CONSTRAINT "EmployeeCapability_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "EmployeeCompensationHistory" (
  "id" TEXT NOT NULL,
  "employeeId" TEXT NOT NULL,
  "paymentType" "PaymentType" NOT NULL,
  "monthlySalary" INTEGER,
  "effectiveFrom" TIMESTAMP(3) NOT NULL,
  "effectiveTo" TIMESTAMP(3),
  "note" TEXT,
  "changedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "EmployeeCompensationHistory_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EmployeeCapability_employeeId_effectiveFrom_effectiveTo_idx"
  ON "EmployeeCapability"("employeeId", "effectiveFrom", "effectiveTo");

CREATE INDEX IF NOT EXISTS "EmployeeCapability_employeeId_garmentTypeId_stepKey_effectiveFrom_idx"
  ON "EmployeeCapability"("employeeId", "garmentTypeId", "stepKey", "effectiveFrom");

CREATE INDEX IF NOT EXISTS "EmployeeCapability_garmentTypeId_stepKey_effectiveFrom_idx"
  ON "EmployeeCapability"("garmentTypeId", "stepKey", "effectiveFrom");

CREATE INDEX IF NOT EXISTS "EmployeeCompensationHistory_employeeId_effectiveFrom_effectiveTo_idx"
  ON "EmployeeCompensationHistory"("employeeId", "effectiveFrom", "effectiveTo");

CREATE INDEX IF NOT EXISTS "EmployeeCompensationHistory_paymentType_effectiveFrom_effectiveTo_idx"
  ON "EmployeeCompensationHistory"("paymentType", "effectiveFrom", "effectiveTo");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCapability_employeeId_fkey'
  ) THEN
    ALTER TABLE "EmployeeCapability"
      ADD CONSTRAINT "EmployeeCapability_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCapability_garmentTypeId_fkey'
  ) THEN
    ALTER TABLE "EmployeeCapability"
      ADD CONSTRAINT "EmployeeCapability_garmentTypeId_fkey"
      FOREIGN KEY ("garmentTypeId") REFERENCES "GarmentType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCapability_createdById_fkey'
  ) THEN
    ALTER TABLE "EmployeeCapability"
      ADD CONSTRAINT "EmployeeCapability_createdById_fkey"
      FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCompensationHistory_employeeId_fkey'
  ) THEN
    ALTER TABLE "EmployeeCompensationHistory"
      ADD CONSTRAINT "EmployeeCompensationHistory_employeeId_fkey"
      FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCompensationHistory_changedById_fkey'
  ) THEN
    ALTER TABLE "EmployeeCompensationHistory"
      ADD CONSTRAINT "EmployeeCompensationHistory_changedById_fkey"
      FOREIGN KEY ("changedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCapability_garment_or_step_required'
  ) THEN
    ALTER TABLE "EmployeeCapability"
      ADD CONSTRAINT "EmployeeCapability_garment_or_step_required"
      CHECK ("garmentTypeId" IS NOT NULL OR "stepKey" IS NOT NULL);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'EmployeeCompensationHistory_payment_salary_consistency'
  ) THEN
    ALTER TABLE "EmployeeCompensationHistory"
      ADD CONSTRAINT "EmployeeCompensationHistory_payment_salary_consistency"
      CHECK (
        ("paymentType" = 'PER_PIECE' AND "monthlySalary" IS NULL) OR
        ("paymentType" = 'MONTHLY_FIXED' AND "monthlySalary" IS NOT NULL AND "monthlySalary" > 0)
      );
  END IF;
END $$;

INSERT INTO "EmployeeCompensationHistory" (
  "id",
  "employeeId",
  "paymentType",
  "monthlySalary",
  "effectiveFrom",
  "effectiveTo",
  "note",
  "createdAt"
)
SELECT
  e.id || '_init_comp',
  e.id,
  e."paymentType",
  e."monthlySalary",
  COALESCE(e."dateOfJoining", e."createdAt", NOW()),
  NULL,
  'Initial backfill from Employee snapshot',
  NOW()
FROM "Employee" e
WHERE NOT EXISTS (
  SELECT 1
  FROM "EmployeeCompensationHistory" ech
  WHERE ech."employeeId" = e.id
);
