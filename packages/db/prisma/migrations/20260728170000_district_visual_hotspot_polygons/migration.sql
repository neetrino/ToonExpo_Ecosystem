-- District model + Building.districtId + VisualHotspot polygon fields + enum extensions
-- Idempotent: safe if partial apply already created some objects.

DO $$ BEGIN
  CREATE TYPE "VisualHotspotShapeType" AS ENUM ('point', 'polygon');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "VisualHotspotInteractionType" AS ENUM ('marker', 'polygon', 'both');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "VisualMapContextType" ADD VALUE 'district';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "VisualHotspotTargetType" ADD VALUE 'district';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "districts" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "districts_project_id_slug_key" ON "districts"("project_id", "slug");
CREATE INDEX IF NOT EXISTS "districts_project_id_idx" ON "districts"("project_id");
CREATE INDEX IF NOT EXISTS "districts_publication_status_idx" ON "districts"("publication_status");

DO $$ BEGIN
  ALTER TABLE "districts" ADD CONSTRAINT "districts_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "buildings" ADD COLUMN "district_id" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "buildings_district_id_idx" ON "buildings"("district_id");

DO $$ BEGIN
  ALTER TABLE "buildings" ADD CONSTRAINT "buildings_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "visual_hotspots" ADD COLUMN "shape_type" "VisualHotspotShapeType" NOT NULL DEFAULT 'point';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "visual_hotspots" ADD COLUMN "interaction_type" "VisualHotspotInteractionType" NOT NULL DEFAULT 'marker';
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "visual_hotspots" ADD COLUMN "svg_path" TEXT;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "visual_hotspots" ADD COLUMN "points" JSONB;
EXCEPTION
  WHEN duplicate_column THEN NULL;
END $$;
