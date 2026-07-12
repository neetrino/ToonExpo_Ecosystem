-- AlterEnum
ALTER TYPE "AnalyticsEventType" ADD VALUE 'BOOTH_SELECTED';
ALTER TYPE "AnalyticsEventType" ADD VALUE 'ROUTE_REQUESTED';

-- AlterTable
ALTER TABLE "Booth" ADD COLUMN "projectId" TEXT;

-- CreateIndex
CREATE INDEX "Booth_projectId_idx" ON "Booth"("projectId");

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
