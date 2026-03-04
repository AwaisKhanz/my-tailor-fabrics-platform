-- Phase 1/2/4 security hardening:
-- 1) Public status PIN hashing compatibility columns.
-- 2) Nullable audit actor support for unknown-user auth failures.

ALTER TABLE "Order"
  ADD COLUMN "sharePinHash" TEXT,
  ADD COLUMN "sharePinMigratedAt" TIMESTAMP(3);

ALTER TABLE "AuditLog"
  ADD COLUMN "actorEmail" TEXT;

ALTER TABLE "AuditLog"
  ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "AuditLog"
  DROP CONSTRAINT "AuditLog_userId_fkey";

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
