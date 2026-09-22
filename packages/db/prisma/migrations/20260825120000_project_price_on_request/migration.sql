-- Project-level price-on-request (inherits to new buildings; cascade on toggle).
ALTER TABLE "projects" ADD COLUMN "price_on_request_enabled" BOOLEAN NOT NULL DEFAULT false;
