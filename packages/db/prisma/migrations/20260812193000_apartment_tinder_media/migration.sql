-- AlterTable
ALTER TABLE "apartments" ADD COLUMN "tinder_media_id" TEXT;

-- AddForeignKey
ALTER TABLE "apartments" ADD CONSTRAINT "apartments_tinder_media_id_fkey" FOREIGN KEY ("tinder_media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
