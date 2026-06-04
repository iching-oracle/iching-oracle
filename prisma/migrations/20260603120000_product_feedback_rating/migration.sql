-- Optional 1–5 satisfaction rating on product feedback
ALTER TABLE "ProductFeedback" ADD COLUMN "rating" INTEGER;

CREATE INDEX "ProductFeedback_rating_createdAt_idx" ON "ProductFeedback"("rating", "createdAt" DESC);
