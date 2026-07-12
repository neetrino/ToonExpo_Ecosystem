-- CreateTable
CREATE TABLE "VenueMap" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageAlt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenueMap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booth" (
    "id" TEXT NOT NULL,
    "venueMapId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "xPercent" DOUBLE PRECISION NOT NULL,
    "yPercent" DOUBLE PRECISION NOT NULL,
    "companyId" TEXT,
    "partnerId" TEXT,
    "note" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VenueMap_eventId_key" ON "VenueMap"("eventId");

-- CreateIndex
CREATE INDEX "Booth_companyId_idx" ON "Booth"("companyId");

-- CreateIndex
CREATE INDEX "Booth_partnerId_idx" ON "Booth"("partnerId");

-- CreateIndex
CREATE INDEX "Booth_venueMapId_sortOrder_idx" ON "Booth"("venueMapId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Booth_venueMapId_code_key" ON "Booth"("venueMapId", "code");

-- AddForeignKey
ALTER TABLE "VenueMap" ADD CONSTRAINT "VenueMap_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "ExhibitionEvent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_venueMapId_fkey" FOREIGN KEY ("venueMapId") REFERENCES "VenueMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booth" ADD CONSTRAINT "Booth_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
