-- CreateTable
CREATE TABLE "project_map_models" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "longitude" DECIMAL(10,7) NOT NULL,
    "latitude" DECIMAL(10,7) NOT NULL,
    "altitude_m" DECIMAL(10,3) NOT NULL DEFAULT 0,
    "heading_deg" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "pitch_deg" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "roll_deg" DECIMAL(8,3) NOT NULL DEFAULT 0,
    "scale" DECIMAL(12,6) NOT NULL DEFAULT 1,
    "min_zoom" DECIMAL(4,1) NOT NULL DEFAULT 14,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_map_models_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "project_map_models_project_id_key" ON "project_map_models"("project_id");

-- CreateIndex
CREATE INDEX "project_map_models_is_published_idx" ON "project_map_models"("is_published");

-- CreateIndex
CREATE INDEX "project_map_models_media_asset_id_idx" ON "project_map_models"("media_asset_id");

-- AddForeignKey
ALTER TABLE "project_map_models" ADD CONSTRAINT "project_map_models_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_map_models" ADD CONSTRAINT "project_map_models_media_asset_id_fkey" FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_map_models" ADD CONSTRAINT "project_map_models_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_map_models" ADD CONSTRAINT "project_map_models_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
