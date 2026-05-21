-- AlterTable
ALTER TABLE "User" ALTER COLUMN "subscriptionStatus" SET NOT NULL;
ALTER TABLE "User" ALTER COLUMN "subscriptionStatus" SET DEFAULT 'free';
ALTER TABLE "User" ADD COLUMN "subscriptionCurrentPeriodEnd" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ProcessedStripeEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProcessedStripeEvent_pkey" PRIMARY KEY ("id")
);
