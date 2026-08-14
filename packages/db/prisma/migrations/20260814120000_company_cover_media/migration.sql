-- Company card cover image (separate from logo).

ALTER TABLE "companies" ADD COLUMN "cover_media_id" TEXT;

ALTER TABLE "companies" ADD CONSTRAINT "companies_cover_media_id_fkey" FOREIGN KEY ("cover_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
