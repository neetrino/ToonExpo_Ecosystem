-- CreateTable
CREATE TABLE "VisualCanvas" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT,
    "status" "PublicationStatus" NOT NULL DEFAULT 'DRAFT',
    "projectId" TEXT,
    "buildingId" TEXT,
    "floorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisualCanvas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Hotspot" (
    "id" TEXT NOT NULL,
    "canvasId" TEXT NOT NULL,
    "x" DOUBLE PRECISION NOT NULL,
    "y" DOUBLE PRECISION NOT NULL,
    "label" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "buildingId" TEXT,
    "floorId" TEXT,
    "apartmentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Hotspot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisualCanvas_projectId_idx" ON "VisualCanvas"("projectId");

-- CreateIndex
CREATE INDEX "VisualCanvas_buildingId_idx" ON "VisualCanvas"("buildingId");

-- CreateIndex
CREATE INDEX "VisualCanvas_floorId_idx" ON "VisualCanvas"("floorId");

-- CreateIndex
CREATE INDEX "VisualCanvas_status_idx" ON "VisualCanvas"("status");

-- CreateIndex
CREATE INDEX "Hotspot_canvasId_idx" ON "Hotspot"("canvasId");

-- CreateIndex
CREATE INDEX "Hotspot_buildingId_idx" ON "Hotspot"("buildingId");

-- CreateIndex
CREATE INDEX "Hotspot_floorId_idx" ON "Hotspot"("floorId");

-- CreateIndex
CREATE INDEX "Hotspot_apartmentId_idx" ON "Hotspot"("apartmentId");

-- AddForeignKey
ALTER TABLE "VisualCanvas" ADD CONSTRAINT "VisualCanvas_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualCanvas" ADD CONSTRAINT "VisualCanvas_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualCanvas" ADD CONSTRAINT "VisualCanvas_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_canvasId_fkey" FOREIGN KEY ("canvasId") REFERENCES "VisualCanvas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_floorId_fkey" FOREIGN KEY ("floorId") REFERENCES "Floor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Hotspot" ADD CONSTRAINT "Hotspot_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
