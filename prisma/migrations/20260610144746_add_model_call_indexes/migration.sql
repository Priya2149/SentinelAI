-- DropIndex
DROP INDEX "KnowledgeChunk_embedding_hnsw";

-- AlterTable
ALTER TABLE "KnowledgeChunk" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "ModelCall_createdAt_idx" ON "ModelCall"("createdAt");

-- CreateIndex
CREATE INDEX "ModelCall_status_createdAt_idx" ON "ModelCall"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ModelCall_model_createdAt_idx" ON "ModelCall"("model", "createdAt");

-- CreateIndex
CREATE INDEX "ModelCall_userId_createdAt_idx" ON "ModelCall"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ModelCall_latencyMs_idx" ON "ModelCall"("latencyMs");

-- CreateIndex
CREATE INDEX "ModelCall_costUsd_idx" ON "ModelCall"("costUsd");
