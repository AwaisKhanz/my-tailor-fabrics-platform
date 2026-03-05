-- Add first-class measurement sections and link fields to sections.

CREATE TABLE "MeasurementSection" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "MeasurementSection_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "MeasurementField"
  ADD COLUMN "sectionId" TEXT;

ALTER TABLE "MeasurementSection"
  ADD CONSTRAINT "MeasurementSection_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "MeasurementCategory"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "MeasurementField"
  ADD CONSTRAINT "MeasurementField_sectionId_fkey"
  FOREIGN KEY ("sectionId") REFERENCES "MeasurementSection"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "MeasurementSection_categoryId_sortOrder_idx"
  ON "MeasurementSection"("categoryId", "sortOrder");

CREATE UNIQUE INDEX "MeasurementSection_categoryId_name_ci_key"
  ON "MeasurementSection"("categoryId", LOWER("name"));

CREATE INDEX "MeasurementField_sectionId_idx"
  ON "MeasurementField"("sectionId");

-- Create a default section for every existing category.
INSERT INTO "MeasurementSection" (
  "id",
  "categoryId",
  "name",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('sec_', SUBSTRING(md5(mc."id" || clock_timestamp()::text || random()::text), 1, 24)),
  mc."id",
  'General',
  0,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "MeasurementCategory" mc
WHERE mc."deletedAt" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "MeasurementSection" ms
    WHERE ms."categoryId" = mc."id"
  );

-- Backfill all existing measurement fields into their category's default section.
UPDATE "MeasurementField" mf
SET "sectionId" = ms."id"
FROM "MeasurementSection" ms
WHERE mf."sectionId" IS NULL
  AND ms."categoryId" = mf."categoryId"
  AND LOWER(ms."name") = 'general';
