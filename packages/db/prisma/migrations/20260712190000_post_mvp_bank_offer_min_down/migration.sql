-- Additive: required min down payment percent per bank-offer entity fields (default 0).
ALTER TABLE "BankOffer" ADD COLUMN "minDownPaymentPercent" DOUBLE PRECISION NOT NULL DEFAULT 0;
