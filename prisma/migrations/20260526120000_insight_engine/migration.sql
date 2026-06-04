-- CreateTable
CREATE TABLE "InsightReportCache" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "periodKey" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InsightReportCache_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OracleMilestone" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "note" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'milestone',
    "readingId" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OracleMilestone_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InsightReportCache_userId_reportType_periodKey_key" ON "InsightReportCache"("userId", "reportType", "periodKey");

-- CreateIndex
CREATE INDEX "InsightReportCache_userId_reportType_generatedAt_idx" ON "InsightReportCache"("userId", "reportType", "generatedAt" DESC);

-- CreateIndex
CREATE INDEX "OracleMilestone_userId_createdAt_idx" ON "OracleMilestone"("userId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "OracleMilestone_userId_kind_idx" ON "OracleMilestone"("userId", "kind");

-- AddForeignKey
ALTER TABLE "InsightReportCache" ADD CONSTRAINT "InsightReportCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OracleMilestone" ADD CONSTRAINT "OracleMilestone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OracleMilestone" ADD CONSTRAINT "OracleMilestone_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE SET NULL ON UPDATE CASCADE;
