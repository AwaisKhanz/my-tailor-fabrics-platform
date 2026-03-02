/*
  Custom migration to safely:
  1. Rename `rate` -> `amount` by adding column, copying data, dropping old.
  2. Add `createdById` by adding with a temp NULL-able state, backfilling with the admin user, then constraining NOT NULL.
  3. Update indexes.
*/

-- DropIndex
DROP INDEX IF EXISTS "RateCard_branchId_garmentTypeId_stepKey_idx";
DROP INDEX IF EXISTS "RateCard_effectiveFrom_effectiveTo_idx";

-- Step 1: Add amount column with a temp default so existing rows don't fail
ALTER TABLE "RateCard" ADD COLUMN "amount" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Copy rate values into amount  
UPDATE "RateCard" SET "amount" = "rate";

-- Step 3: Drop temp default
ALTER TABLE "RateCard" ALTER COLUMN "amount" DROP DEFAULT;

-- Step 4: Drop the old rate column
ALTER TABLE "RateCard" DROP COLUMN "rate";

-- Step 5: Add createdById as nullable initially
ALTER TABLE "RateCard" ADD COLUMN "createdById" TEXT;

-- Step 6: Backfill with the admin user ID
UPDATE "RateCard" SET "createdById" = u.id
FROM (SELECT id FROM "User" WHERE role = 'SUPER_ADMIN' ORDER BY "createdAt" ASC LIMIT 1) u;

-- Step 7: Make it NOT NULL now that all rows are populated
ALTER TABLE "RateCard" ALTER COLUMN "createdById" SET NOT NULL;

-- CreateIndex
CREATE INDEX "RateCard_garmentTypeId_stepKey_branchId_idx" ON "RateCard"("garmentTypeId", "stepKey", "branchId");

-- CreateIndex
CREATE INDEX "RateCard_branchId_idx" ON "RateCard"("branchId");

-- AddForeignKey
ALTER TABLE "RateCard" ADD CONSTRAINT "RateCard_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
