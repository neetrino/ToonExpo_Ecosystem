-- AlterEnum
ALTER TYPE "MediaAssetType" ADD VALUE 'model3d';

-- CreateTable
CREATE TABLE "city_map_placements" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "glb_media_asset_id" TEXT NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "altitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation_x" DOUBLE PRECISION NOT NULL DEFAULT 90,
    "rotation_y" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rotation_z" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "min_zoom" INTEGER NOT NULL DEFAULT 13,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "label_override" TEXT,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "city_map_placements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "city_map_placements_building_id_key" ON "city_map_placements"("building_id");

-- CreateIndex
CREATE INDEX "city_map_placements_project_id_idx" ON "city_map_placements"("project_id");

-- CreateIndex
CREATE INDEX "city_map_placements_publication_status_idx" ON "city_map_placements"("publication_status");

-- AddForeignKey
ALTER TABLE "city_map_placements" ADD CONSTRAINT "city_map_placements_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_map_placements" ADD CONSTRAINT "city_map_placements_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_map_placements" ADD CONSTRAINT "city_map_placements_glb_media_asset_id_fkey" FOREIGN KEY ("glb_media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
