CREATE TABLE "mortgage_applications" (
    "id" TEXT NOT NULL,
    "bank_offer_id" TEXT NOT NULL,
    "buyer_user_id" TEXT NOT NULL,
    "property_price" INTEGER NOT NULL,
    "down_payment_percent" DECIMAL(5,2) NOT NULL,
    "loan_term_years" INTEGER NOT NULL,
    "monthly_payment" INTEGER NOT NULL,
    "loan_amount" INTEGER NOT NULL,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mortgage_applications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "mortgage_applications_bank_offer_id_idx" ON "mortgage_applications"("bank_offer_id");

CREATE INDEX "mortgage_applications_buyer_user_id_idx" ON "mortgage_applications"("buyer_user_id");

ALTER TABLE "mortgage_applications" ADD CONSTRAINT "mortgage_applications_bank_offer_id_fkey" FOREIGN KEY ("bank_offer_id") REFERENCES "bank_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "mortgage_applications" ADD CONSTRAINT "mortgage_applications_buyer_user_id_fkey" FOREIGN KEY ("buyer_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
