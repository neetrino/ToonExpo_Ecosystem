-- CreateEnum
CREATE TYPE "VenuePathNodeKind" AS ENUM ('ENTRANCE', 'WAYPOINT', 'BOOTH');

-- AlterTable
ALTER TABLE "VenueMap" ADD COLUMN "entranceXPercent" DOUBLE PRECISION,
ADD COLUMN "entranceYPercent" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "VenuePathNode" (
    "id" TEXT NOT NULL,
    "venueMapId" TEXT NOT NULL,
    "xPercent" DOUBLE PRECISION NOT NULL,
    "yPercent" DOUBLE PRECISION NOT NULL,
    "kind" "VenuePathNodeKind" NOT NULL,
    "boothId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VenuePathNode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VenuePathEdge" (
    "id" TEXT NOT NULL,
    "venueMapId" TEXT NOT NULL,
    "fromNodeId" TEXT NOT NULL,
    "toNodeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VenuePathEdge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VenuePathNode_venueMapId_kind_idx" ON "VenuePathNode"("venueMapId", "kind");

-- CreateIndex
CREATE UNIQUE INDEX "VenuePathNode_venueMapId_boothId_key" ON "VenuePathNode"("venueMapId", "boothId");

-- CreateIndex
CREATE INDEX "VenuePathEdge_venueMapId_idx" ON "VenuePathEdge"("venueMapId");

-- CreateIndex
CREATE INDEX "VenuePathEdge_fromNodeId_idx" ON "VenuePathEdge"("fromNodeId");

-- CreateIndex
CREATE INDEX "VenuePathEdge_toNodeId_idx" ON "VenuePathEdge"("toNodeId");

-- CreateIndex
CREATE UNIQUE INDEX "VenuePathEdge_venueMapId_fromNodeId_toNodeId_key" ON "VenuePathEdge"("venueMapId", "fromNodeId", "toNodeId");

-- AddForeignKey
ALTER TABLE "VenuePathNode" ADD CONSTRAINT "VenuePathNode_venueMapId_fkey" FOREIGN KEY ("venueMapId") REFERENCES "VenueMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePathNode" ADD CONSTRAINT "VenuePathNode_boothId_fkey" FOREIGN KEY ("boothId") REFERENCES "Booth"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePathEdge" ADD CONSTRAINT "VenuePathEdge_venueMapId_fkey" FOREIGN KEY ("venueMapId") REFERENCES "VenueMap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePathEdge" ADD CONSTRAINT "VenuePathEdge_fromNodeId_fkey" FOREIGN KEY ("fromNodeId") REFERENCES "VenuePathNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VenuePathEdge" ADD CONSTRAINT "VenuePathEdge_toNodeId_fkey" FOREIGN KEY ("toNodeId") REFERENCES "VenuePathNode"("id") ON DELETE CASCADE ON UPDATE CASCADE;
