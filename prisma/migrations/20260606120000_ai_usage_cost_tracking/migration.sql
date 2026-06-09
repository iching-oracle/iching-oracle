-- AI usage cost tracking for admin visibility and abuse prevention

ALTER TABLE "AIUsage" ADD COLUMN "estimatedCostUsd" DOUBLE PRECISION;
