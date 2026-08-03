-- AlterTable: allow unassigned placements + optional OSM identity for extrusion hide
ALTER TABLE "project_map_models" DROP CONSTRAINT "project_map_models_project_id_fkey";

ALTER TABLE "project_map_models" ALTER COLUMN "project_id" DROP NOT NULL;

ALTER TABLE "project_map_models" ADD COLUMN "source_osm_id" TEXT;

CREATE INDEX "project_map_models_source_osm_id_idx" ON "project_map_models"("source_osm_id");

ALTER TABLE "project_map_models" ADD CONSTRAINT "project_map_models_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
