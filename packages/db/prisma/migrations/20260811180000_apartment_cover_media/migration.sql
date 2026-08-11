-- Per-apartment listing/card cover image (falls back to project/building cover when null).

ALTER TABLE "apartments" ADD COLUMN "cover_media_id" TEXT;

ALTER TABLE "apartments" ADD CONSTRAINT "apartments_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
