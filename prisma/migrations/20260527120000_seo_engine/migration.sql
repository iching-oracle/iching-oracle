-- AlterTable
ALTER TABLE "Reading" ADD COLUMN "publicSlug" TEXT;
ALTER TABLE "Reading" ADD COLUMN "seoTitle" TEXT;
ALTER TABLE "Reading" ADD COLUMN "seoDescription" TEXT;
ALTER TABLE "Reading" ADD COLUMN "seoIndexable" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Reading" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Reading" ADD COLUMN "shareCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Reading" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "SeoPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "templateKey" TEXT NOT NULL,
    "hexagramNumber" INTEGER,
    "topic" TEXT,
    "title" TEXT NOT NULL,
    "metaTitle" TEXT NOT NULL,
    "metaDescription" TEXT NOT NULL,
    "canonicalPath" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'published',
    "noindex" BOOLEAN NOT NULL DEFAULT false,
    "readingId" TEXT,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoAnalyticsEvent" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "source" TEXT,
    "keyword" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeoAnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reading_publicSlug_key" ON "Reading"("publicSlug");
CREATE INDEX "Reading_seoIndexable_publishedAt_idx" ON "Reading"("seoIndexable", "publishedAt" DESC);

CREATE UNIQUE INDEX "SeoPage_slug_key" ON "SeoPage"("slug");
CREATE UNIQUE INDEX "SeoPage_canonicalPath_key" ON "SeoPage"("canonicalPath");
CREATE UNIQUE INDEX "SeoPage_readingId_key" ON "SeoPage"("readingId");
CREATE INDEX "SeoPage_type_status_idx" ON "SeoPage"("type", "status");
CREATE INDEX "SeoPage_hexagramNumber_topic_idx" ON "SeoPage"("hexagramNumber", "topic");
CREATE INDEX "SeoPage_status_updatedAt_idx" ON "SeoPage"("status", "updatedAt" DESC);

CREATE INDEX "SeoAnalyticsEvent_path_createdAt_idx" ON "SeoAnalyticsEvent"("path", "createdAt" DESC);
CREATE INDEX "SeoAnalyticsEvent_event_createdAt_idx" ON "SeoAnalyticsEvent"("event", "createdAt" DESC);

-- AddForeignKey
ALTER TABLE "SeoPage" ADD CONSTRAINT "SeoPage_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE SET NULL ON UPDATE CASCADE;
