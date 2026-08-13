-- AlterTable
ALTER TABLE "readiness_criteria" ADD COLUMN "service_provider_category_id" TEXT;

-- CreateIndex
CREATE INDEX "readiness_criteria_service_provider_category_id_idx" ON "readiness_criteria"("service_provider_category_id");

-- AddForeignKey
ALTER TABLE "readiness_criteria" ADD CONSTRAINT "readiness_criteria_service_provider_category_id_fkey" FOREIGN KEY ("service_provider_category_id") REFERENCES "service_provider_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
