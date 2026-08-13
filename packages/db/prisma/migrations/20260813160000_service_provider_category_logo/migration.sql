-- AlterTable
ALTER TABLE "service_provider_categories" ADD COLUMN "logo_media_id" TEXT;

-- CreateIndex
CREATE INDEX "service_provider_categories_logo_media_id_idx" ON "service_provider_categories"("logo_media_id");

-- AddForeignKey
ALTER TABLE "service_provider_categories" ADD CONSTRAINT "service_provider_categories_logo_media_id_fkey" FOREIGN KEY ("logo_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
