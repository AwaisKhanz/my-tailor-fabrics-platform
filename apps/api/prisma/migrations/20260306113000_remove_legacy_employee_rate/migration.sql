ALTER TABLE "GarmentType"
DROP COLUMN IF EXISTS "employeeRate";

ALTER TABLE "OrderItem"
DROP COLUMN IF EXISTS "employeeRate";

ALTER TABLE "GarmentPriceLog"
DROP COLUMN IF EXISTS "oldEmployeeRate";

ALTER TABLE "GarmentPriceLog"
DROP COLUMN IF EXISTS "newEmployeeRate";
