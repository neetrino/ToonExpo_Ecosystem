-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('planning', 'active', 'completed', 'archived', 'cancelled');

-- CreateEnum
CREATE TYPE "BoothType" AS ENUM ('builder', 'bank', 'partner', 'sponsor', 'service', 'info', 'entrance', 'other');

-- CreateEnum
CREATE TYPE "RouteNodeType" AS ENUM ('entrance', 'intersection', 'booth', 'info', 'other');

-- CreateEnum
CREATE TYPE "CheckInStatus" AS ENUM ('allowed', 'denied_invalid_qr', 'denied_blocked', 'duplicate_checkin', 'error');

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "status" "EventStatus" NOT NULL DEFAULT 'planning',
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "venue_maps" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "width" INTEGER,
    "height" INTEGER,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "venue_maps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booths" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "venue_map_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "type" "BoothType" NOT NULL,
    "x_percent" DECIMAL(6,3) NOT NULL,
    "y_percent" DECIMAL(6,3) NOT NULL,
    "shape_data" JSONB,
    "location_text" TEXT,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booths_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booth_assignments" (
    "id" TEXT NOT NULL,
    "booth_id" TEXT NOT NULL,
    "company_id" TEXT,
    "project_id" TEXT,
    "assignment_label" TEXT,
    "sort_order" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booth_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_nodes" (
    "id" TEXT NOT NULL,
    "venue_map_id" TEXT NOT NULL,
    "code" TEXT,
    "label" TEXT,
    "x_percent" DECIMAL(6,3) NOT NULL,
    "y_percent" DECIMAL(6,3) NOT NULL,
    "type" "RouteNodeType" NOT NULL,
    "booth_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "route_edges" (
    "id" TEXT NOT NULL,
    "venue_map_id" TEXT NOT NULL,
    "from_node_id" TEXT NOT NULL,
    "to_node_id" TEXT NOT NULL,
    "weight" DECIMAL(10,4),
    "accessible" BOOLEAN,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "route_edges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "check_in_records" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "buyer_profile_id" TEXT NOT NULL,
    "qr_code_id" TEXT NOT NULL,
    "scan_event_id" TEXT,
    "checked_in_by_user_id" TEXT NOT NULL,
    "status" "CheckInStatus" NOT NULL,
    "checked_in_at" TIMESTAMP(3) NOT NULL,
    "duplicate_of_check_in_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "check_in_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_code_key" ON "events"("code");

-- CreateIndex
CREATE INDEX "events_status_idx" ON "events"("status");

-- CreateIndex
CREATE INDEX "events_publication_status_idx" ON "events"("publication_status");

-- CreateIndex
CREATE INDEX "venue_maps_event_id_idx" ON "venue_maps"("event_id");

-- CreateIndex
CREATE INDEX "venue_maps_publication_status_idx" ON "venue_maps"("publication_status");

-- CreateIndex
CREATE UNIQUE INDEX "booths_event_id_code_key" ON "booths"("event_id", "code");

-- CreateIndex
CREATE INDEX "booths_venue_map_id_idx" ON "booths"("venue_map_id");

-- CreateIndex
CREATE INDEX "booths_publication_status_idx" ON "booths"("publication_status");

-- CreateIndex
CREATE INDEX "booth_assignments_booth_id_idx" ON "booth_assignments"("booth_id");

-- CreateIndex
CREATE INDEX "booth_assignments_company_id_idx" ON "booth_assignments"("company_id");

-- CreateIndex
CREATE INDEX "booth_assignments_project_id_idx" ON "booth_assignments"("project_id");

-- CreateIndex
CREATE INDEX "route_nodes_venue_map_id_idx" ON "route_nodes"("venue_map_id");

-- CreateIndex
CREATE INDEX "route_nodes_booth_id_idx" ON "route_nodes"("booth_id");

-- CreateIndex
CREATE UNIQUE INDEX "route_edges_from_node_id_to_node_id_key" ON "route_edges"("from_node_id", "to_node_id");

-- CreateIndex
CREATE INDEX "route_edges_venue_map_id_idx" ON "route_edges"("venue_map_id");

-- CreateIndex
CREATE INDEX "check_in_records_event_id_idx" ON "check_in_records"("event_id");

-- CreateIndex
CREATE INDEX "check_in_records_buyer_profile_id_idx" ON "check_in_records"("buyer_profile_id");

-- CreateIndex
CREATE INDEX "check_in_records_checked_in_by_user_id_idx" ON "check_in_records"("checked_in_by_user_id");

-- CreateIndex
CREATE INDEX "check_in_records_status_idx" ON "check_in_records"("status");

-- CreateIndex
CREATE INDEX "check_in_records_checked_in_at_idx" ON "check_in_records"("checked_in_at");

-- Partial unique: at most one allowed check-in per (event_id, buyer_profile_id).
CREATE UNIQUE INDEX "check_in_records_event_buyer_allowed_key"
ON "check_in_records" ("event_id", "buyer_profile_id")
WHERE ("status" = 'allowed');

-- AddForeignKey
ALTER TABLE "venue_maps" ADD CONSTRAINT "venue_maps_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_maps" ADD CONSTRAINT "venue_maps_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_maps" ADD CONSTRAINT "venue_maps_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "venue_maps" ADD CONSTRAINT "venue_maps_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booths" ADD CONSTRAINT "booths_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booths" ADD CONSTRAINT "booths_venue_map_id_fkey" FOREIGN KEY ("venue_map_id") REFERENCES "venue_maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_assignments" ADD CONSTRAINT "booth_assignments_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_assignments" ADD CONSTRAINT "booth_assignments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booth_assignments" ADD CONSTRAINT "booth_assignments_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_nodes" ADD CONSTRAINT "route_nodes_venue_map_id_fkey" FOREIGN KEY ("venue_map_id") REFERENCES "venue_maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_nodes" ADD CONSTRAINT "route_nodes_booth_id_fkey" FOREIGN KEY ("booth_id") REFERENCES "booths"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_edges" ADD CONSTRAINT "route_edges_venue_map_id_fkey" FOREIGN KEY ("venue_map_id") REFERENCES "venue_maps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_edges" ADD CONSTRAINT "route_edges_from_node_id_fkey" FOREIGN KEY ("from_node_id") REFERENCES "route_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "route_edges" ADD CONSTRAINT "route_edges_to_node_id_fkey" FOREIGN KEY ("to_node_id") REFERENCES "route_nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_qr_code_id_fkey" FOREIGN KEY ("qr_code_id") REFERENCES "qr_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_scan_event_id_fkey" FOREIGN KEY ("scan_event_id") REFERENCES "qr_scan_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_checked_in_by_user_id_fkey" FOREIGN KEY ("checked_in_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "check_in_records" ADD CONSTRAINT "check_in_records_duplicate_of_check_in_id_fkey" FOREIGN KEY ("duplicate_of_check_in_id") REFERENCES "check_in_records"("id") ON DELETE SET NULL ON UPDATE CASCADE;
