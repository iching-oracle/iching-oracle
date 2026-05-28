-- CreateTable
CREATE TABLE "ProductAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "distinctId" TEXT,
    "funnel" TEXT,
    "properties" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProductAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_event_createdAt_idx" ON "ProductAnalyticsEvent"("event", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_userId_createdAt_idx" ON "ProductAnalyticsEvent"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_sessionId_createdAt_idx" ON "ProductAnalyticsEvent"("sessionId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_funnel_createdAt_idx" ON "ProductAnalyticsEvent"("funnel", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "ProductAnalyticsEvent_createdAt_idx" ON "ProductAnalyticsEvent"("createdAt" DESC);
