-- CreateTable
CREATE TABLE "bank_partner_offer_templates" (
    "id" TEXT NOT NULL,
    "partner_company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "publication_status" "PublicationStatus" NOT NULL DEFAULT 'draft',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bank_partner_offer_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "project_bank_partner_offers" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "template_id" TEXT,
    "partner_company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fields" JSONB NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_by_user_id" TEXT NOT NULL,
    "updated_by_user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_bank_partner_offers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bank_partner_offer_templates_partner_company_id_idx" ON "bank_partner_offer_templates"("partner_company_id");

-- CreateIndex
CREATE INDEX "bank_partner_offer_templates_publication_status_idx" ON "bank_partner_offer_templates"("publication_status");

-- CreateIndex
CREATE INDEX "bank_partner_offer_templates_sort_order_idx" ON "bank_partner_offer_templates"("sort_order");

-- CreateIndex
CREATE INDEX "project_bank_partner_offers_project_id_idx" ON "project_bank_partner_offers"("project_id");

-- CreateIndex
CREATE INDEX "project_bank_partner_offers_partner_company_id_idx" ON "project_bank_partner_offers"("partner_company_id");

-- CreateIndex
CREATE INDEX "project_bank_partner_offers_template_id_idx" ON "project_bank_partner_offers"("template_id");

-- CreateIndex
CREATE UNIQUE INDEX "project_bank_partner_offers_project_id_template_id_key" ON "project_bank_partner_offers"("project_id", "template_id");

-- AddForeignKey
ALTER TABLE "bank_partner_offer_templates" ADD CONSTRAINT "bank_partner_offer_templates_partner_company_id_fkey" FOREIGN KEY ("partner_company_id") REFERENCES "partner_companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_partner_offer_templates" ADD CONSTRAINT "bank_partner_offer_templates_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bank_partner_offer_templates" ADD CONSTRAINT "bank_partner_offer_templates_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_bank_partner_offers" ADD CONSTRAINT "project_bank_partner_offers_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_bank_partner_offers" ADD CONSTRAINT "project_bank_partner_offers_template_id_fkey" FOREIGN KEY ("template_id") REFERENCES "bank_partner_offer_templates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_bank_partner_offers" ADD CONSTRAINT "project_bank_partner_offers_partner_company_id_fkey" FOREIGN KEY ("partner_company_id") REFERENCES "partner_companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_bank_partner_offers" ADD CONSTRAINT "project_bank_partner_offers_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_bank_partner_offers" ADD CONSTRAINT "project_bank_partner_offers_updated_by_user_id_fkey" FOREIGN KEY ("updated_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
