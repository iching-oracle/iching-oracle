-- Weekly Oracle Email newsletter opt-in and send deduplication
ALTER TABLE "User" ADD COLUMN "weeklyOracleEnabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "lastWeeklyOracleEmailAt" TIMESTAMP(3);
