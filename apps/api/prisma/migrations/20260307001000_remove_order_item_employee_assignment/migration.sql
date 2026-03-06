-- Remove legacy order item level employee assignment.
-- Assignment is now task-level only via OrderItemTask.assignedEmployeeId.
ALTER TABLE "OrderItem" DROP CONSTRAINT IF EXISTS "OrderItem_employeeId_fkey";
DROP INDEX IF EXISTS "OrderItem_employeeId_status_idx";
ALTER TABLE "OrderItem" DROP COLUMN IF EXISTS "employeeId";
