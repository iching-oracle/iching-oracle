-- AlterTable
ALTER TABLE "User" ADD COLUMN "dailyStreak" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "User" ADD COLUMN "lastDailyVisit" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DailyOracle" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "visitorKey" TEXT,
    "date" DATE NOT NULL,
    "hexagramNumber" INTEGER NOT NULL,
    "lineValues" TEXT NOT NULL,
    "oracleMessage" TEXT NOT NULL,
    "emotionalInsight" TEXT NOT NULL,
    "recommendedAction" TEXT NOT NULL,
    "caution" TEXT NOT NULL,
    "reflectionQuote" TEXT NOT NULL,
    "luckyFocus" TEXT NOT NULL,
    "energyLevel" INTEGER NOT NULL DEFAULT 50,
    "energyTheme" TEXT NOT NULL DEFAULT 'balanced',
    "interpretation" TEXT NOT NULL,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyOracle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyOracle_userId_date_idx" ON "DailyOracle"("userId", "date" DESC);

-- CreateIndex
CREATE INDEX "DailyOracle_visitorKey_date_idx" ON "DailyOracle"("visitorKey", "date" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "DailyOracle_userId_date_key" ON "DailyOracle"("userId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyOracle_visitorKey_date_key" ON "DailyOracle"("visitorKey", "date");

-- AddForeignKey
ALTER TABLE "DailyOracle" ADD CONSTRAINT "DailyOracle_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
