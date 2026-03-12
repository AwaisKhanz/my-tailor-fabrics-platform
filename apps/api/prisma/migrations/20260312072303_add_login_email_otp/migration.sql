ALTER TABLE "User"
  ADD COLUMN "pendingLoginChallengeId" TEXT,
  ADD COLUMN "pendingLoginOtpHash" TEXT,
  ADD COLUMN "pendingLoginOtpExpiresAt" TIMESTAMP(3),
  ADD COLUMN "pendingLoginOtpAttempts" INTEGER NOT NULL DEFAULT 0;

CREATE UNIQUE INDEX "User_pendingLoginChallengeId_key"
  ON "User"("pendingLoginChallengeId");
