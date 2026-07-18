-- CreateEnum
CREATE TYPE "VisualMapContextType" AS ENUM ('project', 'building', 'floor');

-- CreateEnum
CREATE TYPE "VisualHotspotTargetType" AS ENUM ('building', 'floor', 'apartment');

-- CreateTable
CREATE TABLE "visual_map_canvases" (
    "id" TEXT NOT NULL,
    "owner_company_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "context_type" "VisualMapContextType" NOT NULL,
    "context_id" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visual_map_canvases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visual_hotspots" (
    "id" TEXT NOT NULL,
    "canvas_id" TEXT NOT NULL,
    "target_type" "VisualHotspotTargetType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "x_percent" DECIMAL(6,3) NOT NULL,
    "y_percent" DECIMAL(6,3) NOT NULL,
    "marker_style" TEXT,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "visual_hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "visual_map_canvases_project_id_context_type_context_id_idx" ON "visual_map_canvases"("project_id", "context_type", "context_id");

-- CreateIndex
CREATE INDEX "visual_map_canvases_owner_company_id_idx" ON "visual_map_canvases"("owner_company_id");

-- CreateIndex
CREATE INDEX "visual_map_canvases_publication_status_idx" ON "visual_map_canvases"("publication_status");

-- CreateIndex
CREATE INDEX "visual_hotspots_canvas_id_idx" ON "visual_hotspots"("canvas_id");

-- CreateIndex
CREATE INDEX "visual_hotspots_publication_status_idx" ON "visual_hotspots"("publication_status");

-- AddForeignKey
ALTER TABLE "visual_map_canvases" ADD CONSTRAINT "visual_map_canvases_owner_company_id_fkey" FOREIGN KEY ("owner_company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_map_canvases" ADD CONSTRAINT "visual_map_canvases_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_map_canvases" ADD CONSTRAINT "visual_map_canvases_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_map_canvases" ADD CONSTRAINT "visual_map_canvases_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_map_canvases" ADD CONSTRAINT "visual_map_canvases_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_hotspots" ADD CONSTRAINT "visual_hotspots_canvas_id_fkey" FOREIGN KEY ("canvas_id") REFERENCES "visual_map_canvases"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_hotspots" ADD CONSTRAINT "visual_hotspots_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visual_hotspots" ADD CONSTRAINT "visual_hotspots_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
