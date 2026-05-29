-- Rename refresh timestamp and add billing-cycle tracking
ALTER TABLE "User" RENAME COLUMN "creditsRefreshedAt" TO "lastCreditRefillAt";

ALTER TABLE "User" ADD COLUMN "creditsResetAt" TIMESTAMP(3),
ADD COLUMN "lastCreditRefillPeriodEnd" TIMESTAMP(3);

-- Idempotent premium refill log (Stripe invoice / billing period)
CREATE TABLE "CreditBillingRefill" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeInvoiceId" TEXT,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "quota" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CreditBillingRefill_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CreditBillingRefill_stripeInvoiceId_key" ON "CreditBillingRefill"("stripeInvoiceId");
CREATE UNIQUE INDEX "CreditBillingRefill_userId_periodEnd_key" ON "CreditBillingRefill"("userId", "periodEnd");
CREATE INDEX "CreditBillingRefill_userId_createdAt_idx" ON "CreditBillingRefill"("userId", "createdAt" DESC);

ALTER TABLE "CreditBillingRefill" ADD CONSTRAINT "CreditBillingRefill_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
