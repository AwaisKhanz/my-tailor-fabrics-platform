-- Security hardening: support refresh-token rotation with a short grace window.
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "previousRefreshToken" TEXT,
  ADD COLUMN IF NOT EXISTS "previousRefreshTokenExpiresAt" TIMESTAMP(3);
