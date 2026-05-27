-- AlterTable
ALTER TABLE "User" ADD COLUMN "planType" TEXT NOT NULL DEFAULT 'FREE';
ALTER TABLE "User" ADD COLUMN "credits" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "User" ADD COLUMN "monthlyCredits" INTEGER NOT NULL DEFAULT 10;
ALTER TABLE "User" ADD COLUMN "lifetimeCreditsUsed" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "creditsRefreshedAt" TIMESTAMP(3);

-- Premium users get monthly allocation
UPDATE "User"
SET
  "planType" = 'PREMIUM',
  "credits" = 500,
  "monthlyCredits" = 500
WHERE "subscriptionStatus" = 'premium'
  AND ("subscriptionCurrentPeriodEnd" IS NULL OR "subscriptionCurrentPeriodEnd" > NOW());

-- CreateTable
CREATE TABLE "AIUsage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "featureType" TEXT NOT NULL,
    "creditsUsed" INTEGER NOT NULL,
    "estimatedTokenUsage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AIUsage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreditTransaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AIUsage_userId_createdAt_idx" ON "AIUsage"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "AIUsage_userId_featureType_idx" ON "AIUsage"("userId", "featureType");

-- CreateIndex
CREATE INDEX "CreditTransaction_userId_createdAt_idx" ON "CreditTransaction"("userId", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "AIUsage" ADD CONSTRAINT "AIUsage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreditTransaction" ADD CONSTRAINT "CreditTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
