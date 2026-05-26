-- CreateTable
CREATE TABLE "PatternInsightCache" (
    "userId" TEXT NOT NULL,
    "revision" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatternInsightCache_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "PatternInsightCache" ADD CONSTRAINT "PatternInsightCache_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
