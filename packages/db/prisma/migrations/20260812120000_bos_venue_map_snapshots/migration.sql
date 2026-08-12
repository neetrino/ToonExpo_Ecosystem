-- CreateEnum
CREATE TYPE "PublicVenueMapSnapshotStatus" AS ENUM ('pending', 'active', 'archived');

-- CreateEnum
CREATE TYPE "MapPublicationReceiptStatus" AS ENUM ('published', 'already_published', 'rejected', 'failed');

-- CreateEnum
CREATE TYPE "PublicVenueAreaDisplayMode" AS ENUM ('organization', 'custom_label', 'hidden');

-- CreateTable
CREATE TABLE "public_venue_map_snapshots" (
    "id" TEXT NOT NULL,
    "schema_version" TEXT NOT NULL,
    "bos_venue_plan_id" TEXT NOT NULL,
    "bos_event_cycle_id" TEXT NOT NULL,
    "bos_event_cycle_code" TEXT NOT NULL,
    "snapshot_version" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "background_media_asset_id" TEXT NOT NULL,
    "map_width" INTEGER NOT NULL,
    "map_height" INTEGER NOT NULL,
    "pixels_per_meter" DECIMAL(12,4) NOT NULL,
    "grid_origin_x" INTEGER NOT NULL,
    "grid_origin_y" INTEGER NOT NULL,
    "status" "PublicVenueMapSnapshotStatus" NOT NULL,
    "published_by_bos_at" TIMESTAMP(3) NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_venue_map_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_venue_areas" (
    "id" TEXT NOT NULL,
    "snapshot_id" TEXT NOT NULL,
    "bos_space_area_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "geometry" JSONB NOT NULL,
    "area_sqm" DECIMAL(12,2) NOT NULL,
    "display_mode" "PublicVenueAreaDisplayMode" NOT NULL,
    "public_label" TEXT,
    "company_id" TEXT,
    "sort_order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "public_venue_areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "map_publication_receipts" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "bos_venue_plan_id" TEXT NOT NULL,
    "snapshot_version" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "status" "MapPublicationReceiptStatus" NOT NULL,
    "snapshot_id" TEXT,
    "validation_errors" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "activated_at" TIMESTAMP(3),

    CONSTRAINT "map_publication_receipts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "public_venue_snapshots_plan_version_key" ON "public_venue_map_snapshots"("bos_venue_plan_id", "snapshot_version");

-- CreateIndex
CREATE INDEX "public_venue_map_snapshots_bos_venue_plan_id_status_idx" ON "public_venue_map_snapshots"("bos_venue_plan_id", "status");

-- CreateIndex
CREATE INDEX "public_venue_map_snapshots_status_idx" ON "public_venue_map_snapshots"("status");

-- CreateIndex
CREATE UNIQUE INDEX "public_venue_areas_snapshot_id_bos_space_area_id_key" ON "public_venue_areas"("snapshot_id", "bos_space_area_id");

-- CreateIndex
CREATE INDEX "public_venue_areas_snapshot_id_idx" ON "public_venue_areas"("snapshot_id");

-- CreateIndex
CREATE INDEX "public_venue_areas_company_id_idx" ON "public_venue_areas"("company_id");

-- CreateIndex
CREATE UNIQUE INDEX "map_publication_receipts_request_id_key" ON "map_publication_receipts"("request_id");

-- CreateIndex
CREATE INDEX "map_publication_receipts_bos_venue_plan_id_snapshot_version_idx" ON "map_publication_receipts"("bos_venue_plan_id", "snapshot_version");

-- CreateIndex
CREATE INDEX "map_publication_receipts_status_idx" ON "map_publication_receipts"("status");

-- AddForeignKey
ALTER TABLE "public_venue_map_snapshots" ADD CONSTRAINT "public_venue_map_snapshots_background_media_asset_id_fkey" FOREIGN KEY ("background_media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_venue_areas" ADD CONSTRAINT "public_venue_areas_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "public_venue_map_snapshots"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_venue_areas" ADD CONSTRAINT "public_venue_areas_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "map_publication_receipts" ADD CONSTRAINT "map_publication_receipts_snapshot_id_fkey" FOREIGN KEY ("snapshot_id") REFERENCES "public_venue_map_snapshots"("id") ON DELETE SET NULL ON UPDATE CASCADE;
