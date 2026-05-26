-- CreateTable
CREATE TABLE "OracleConversation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "readingId" TEXT,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OracleConversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OracleMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OracleMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OracleConversation_readingId_key" ON "OracleConversation"("readingId");

-- CreateIndex
CREATE INDEX "OracleConversation_userId_updatedAt_idx" ON "OracleConversation"("userId", "updatedAt" DESC);

-- CreateIndex
CREATE INDEX "OracleMessage_conversationId_createdAt_idx" ON "OracleMessage"("conversationId", "createdAt");

-- AddForeignKey
ALTER TABLE "OracleConversation" ADD CONSTRAINT "OracleConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OracleConversation" ADD CONSTRAINT "OracleConversation_readingId_fkey" FOREIGN KEY ("readingId") REFERENCES "Reading"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OracleMessage" ADD CONSTRAINT "OracleMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "OracleConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
