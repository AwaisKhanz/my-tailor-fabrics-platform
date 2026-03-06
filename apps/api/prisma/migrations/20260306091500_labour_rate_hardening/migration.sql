-- Step 1: Snapshot design rates on tasks for historical payout stability.
ALTER TABLE "OrderItemTask"
ADD COLUMN "designRateSnapshot" INTEGER;

UPDATE "OrderItemTask" oit
SET "designRateSnapshot" = dt."defaultRate"
FROM "DesignType" dt
WHERE oit."designTypeId" = dt.id
  AND oit."designRateSnapshot" IS NULL;

-- Step 2: Close duplicate open rates before enforcing unique partial indexes.
WITH ranked_open_rates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY COALESCE("branchId", '__GLOBAL__'), "garmentTypeId", "stepKey"
      ORDER BY "effectiveFrom" DESC, "createdAt" DESC, id DESC
    ) AS rank_no
  FROM "RateCard"
  WHERE "effectiveTo" IS NULL
    AND "deletedAt" IS NULL
)
UPDATE "RateCard" rc
SET "effectiveTo" = rc."effectiveFrom"
FROM ranked_open_rates ranked
WHERE rc.id = ranked.id
  AND ranked.rank_no > 1;

-- Step 3: Enforce one active open rate per scope.
CREATE UNIQUE INDEX "RateCard_open_global_unique_idx"
ON "RateCard" ("garmentTypeId", "stepKey")
WHERE "branchId" IS NULL
  AND "effectiveTo" IS NULL
  AND "deletedAt" IS NULL;

CREATE UNIQUE INDEX "RateCard_open_branch_unique_idx"
ON "RateCard" ("branchId", "garmentTypeId", "stepKey")
WHERE "branchId" IS NOT NULL
  AND "effectiveTo" IS NULL
  AND "deletedAt" IS NULL;

-- Step 4: Add rate lookup indexes for branch-first then global fallback resolution.
CREATE INDEX "RateCard_branch_effective_lookup_idx"
ON "RateCard" ("branchId", "garmentTypeId", "stepKey", "effectiveFrom" DESC)
WHERE "deletedAt" IS NULL;

CREATE INDEX "RateCard_global_effective_lookup_idx"
ON "RateCard" ("garmentTypeId", "stepKey", "effectiveFrom" DESC)
WHERE "branchId" IS NULL
  AND "deletedAt" IS NULL;
