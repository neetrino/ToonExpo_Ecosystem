-- Ordered apartment photo gallery; cover_media_id remains the “main” pointer.

CREATE TABLE "apartment_gallery_images" (
    "id" TEXT NOT NULL,
    "apartment_id" TEXT NOT NULL,
    "media_asset_id" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "apartment_gallery_images_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "apartment_gallery_images_apartment_id_media_asset_id_key"
  ON "apartment_gallery_images"("apartment_id", "media_asset_id");

CREATE INDEX "apartment_gallery_images_apartment_id_sort_order_idx"
  ON "apartment_gallery_images"("apartment_id", "sort_order");

ALTER TABLE "apartment_gallery_images"
  ADD CONSTRAINT "apartment_gallery_images_apartment_id_fkey"
  FOREIGN KEY ("apartment_id") REFERENCES "apartments"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "apartment_gallery_images"
  ADD CONSTRAINT "apartment_gallery_images_media_asset_id_fkey"
  FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: existing covers become the first gallery image.
INSERT INTO "apartment_gallery_images" ("id", "apartment_id", "media_asset_id", "sort_order", "created_at")
SELECT
  concat('gal_', a."id"),
  a."id",
  a."cover_media_id",
  0,
  CURRENT_TIMESTAMP
FROM "apartments" a
WHERE a."cover_media_id" IS NOT NULL
ON CONFLICT DO NOTHING;
