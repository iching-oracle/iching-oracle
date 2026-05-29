-- AlterTable
ALTER TABLE "User" ADD COLUMN "lastActivityAt" TIMESTAMP(3),
ADD COLUMN "emailDailyGuidance" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailWeeklyReflection" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailReengagement" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN "emailProductUpdates" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailMarketing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "emailUnsubscribeToken" TEXT,
ADD COLUMN "emailGlobalUnsubscribedAt" TIMESTAMP(3),
ADD COLUMN "lastDailyEmailAt" TIMESTAMP(3),
ADD COLUMN "lastWeeklyEmailAt" TIMESTAMP(3),
ADD COLUMN "lastReengagementEmailAt" TIMESTAMP(3),
ADD COLUMN "lastReengagementTier" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "User_emailUnsubscribeToken_key" ON "User"("emailUnsubscribeToken");

-- CreateTable
CREATE TABLE "EmailSendLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "resendId" TEXT,
    "subject" TEXT,
    "openedAt" TIMESTAMP(3),
    "clickedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailSendLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EmailSendLog_userId_type_createdAt_idx" ON "EmailSendLog"("userId", "type", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "EmailSendLog_type_createdAt_idx" ON "EmailSendLog"("type", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "EmailSendLog" ADD CONSTRAINT "EmailSendLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
