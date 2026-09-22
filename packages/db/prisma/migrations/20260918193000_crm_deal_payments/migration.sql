-- CRM deal payment history (installments against the linked apartment price).
CREATE TABLE "crm_deal_payments" (
    "id" TEXT NOT NULL,
    "crm_deal_id" TEXT NOT NULL,
    "amount" DECIMAL(14,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'AMD',
    "note" TEXT,
    "created_by_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crm_deal_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "crm_deal_payments_crm_deal_id_idx" ON "crm_deal_payments"("crm_deal_id");
CREATE INDEX "crm_deal_payments_created_at_idx" ON "crm_deal_payments"("created_at");

ALTER TABLE "crm_deal_payments" ADD CONSTRAINT "crm_deal_payments_crm_deal_id_fkey" FOREIGN KEY ("crm_deal_id") REFERENCES "crm_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "crm_deal_payments" ADD CONSTRAINT "crm_deal_payments_created_by_user_id_fkey" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
