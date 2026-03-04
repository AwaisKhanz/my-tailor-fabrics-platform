-- Security hardening: enforce case-insensitive uniqueness for User.email.
-- This prevents duplicate accounts that differ only by letter case.

DO $$
DECLARE
  duplicate_email TEXT;
BEGIN
  SELECT lower("email")
  INTO duplicate_email
  FROM "User"
  GROUP BY lower("email")
  HAVING COUNT(*) > 1
  LIMIT 1;

  IF duplicate_email IS NOT NULL THEN
    RAISE EXCEPTION
      'Cannot enforce case-insensitive email uniqueness; duplicate email value exists: %',
      duplicate_email;
  END IF;
END;
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_lower_key"
ON "User" (LOWER("email"));
