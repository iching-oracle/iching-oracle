-- Closed beta: waitlist, invites, feedback, announcements

ALTER TABLE "User" ADD COLUMN "isBetaMember" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "betaJoinedAt" TIMESTAMP(3),
ADD COLUMN "inviteCodeUsed" TEXT;

ALTER TABLE "WaitlistEntry" ADD COLUMN "name" TEXT,
ADD COLUMN "referralCode" TEXT,
ADD COLUMN "status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN "waitlistPosition" INTEGER,
ADD COLUMN "invitedAt" TIMESTAMP(3),
ADD COLUMN "joinedAt" TIMESTAMP(3),
ADD COLUMN "userId" TEXT,
ADD COLUMN "inviteCodeId" TEXT,
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE UNIQUE INDEX "WaitlistEntry_userId_key" ON "WaitlistEntry"("userId");
CREATE INDEX "WaitlistEntry_status_createdAt_idx" ON "WaitlistEntry"("status", "createdAt" DESC);

ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "InviteCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "email" TEXT,
    "note" TEXT,
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "useCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3),
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InviteCode_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InviteCode_code_key" ON "InviteCode"("code");
CREATE INDEX "InviteCode_email_idx" ON "InviteCode"("email");
CREATE INDEX "InviteCode_createdAt_idx" ON "InviteCode"("createdAt" DESC);

ALTER TABLE "WaitlistEntry" ADD CONSTRAINT "WaitlistEntry_inviteCodeId_fkey" FOREIGN KEY ("inviteCodeId") REFERENCES "InviteCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "ReadingFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readingId" TEXT NOT NULL,
    "resonance" TEXT NOT NULL,
    "comment" TEXT,
    "category" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadingFeedback_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ReadingFeedback_userId_readingId_key" ON "ReadingFeedback"("userId", "readingId");
CREATE INDEX "ReadingFeedback_resonance_createdAt_idx" ON "ReadingFeedback"("resonance", "createdAt" DESC);

ALTER TABLE "ReadingFeedback" ADD CONSTRAINT "ReadingFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "ProductFeedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "severity" TEXT,
    "flow" TEXT,
    "pagePath" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ProductFeedback_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ProductFeedback_type_createdAt_idx" ON "ProductFeedback"("type", "createdAt" DESC);
CREATE INDEX "ProductFeedback_userId_createdAt_idx" ON "ProductFeedback"("userId", "createdAt" DESC);

ALTER TABLE "ProductFeedback" ADD CONSTRAINT "ProductFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "BetaAnnouncement" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'update',
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BetaAnnouncement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "BetaAnnouncement_publishedAt_idx" ON "BetaAnnouncement"("publishedAt" DESC);
CREATE INDEX "BetaAnnouncement_isPinned_publishedAt_idx" ON "BetaAnnouncement"("isPinned", "publishedAt" DESC);
