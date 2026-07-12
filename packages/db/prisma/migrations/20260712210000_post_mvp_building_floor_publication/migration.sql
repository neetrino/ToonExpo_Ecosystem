-- AlterTable
ALTER TABLE "Building" ADD COLUMN "description" TEXT,
ADD COLUMN "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

-- AlterTable
ALTER TABLE "Floor" ADD COLUMN "status" "PublicationStatus" NOT NULL DEFAULT 'PUBLISHED';

-- CreateIndex
CREATE INDEX "Building_status_idx" ON "Building"("status");

-- CreateIndex
CREATE INDEX "Floor_status_idx" ON "Floor"("status");
