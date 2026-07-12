-- CreateEnum
CREATE TYPE "PriceVisibility" AS ENUM ('PUBLIC', 'BY_REQUEST', 'HIDDEN', 'VISIBLE_AFTER_LOGIN');

-- AlterTable
ALTER TABLE "Apartment" ADD COLUMN "priceVisibility" "PriceVisibility" NOT NULL DEFAULT 'PUBLIC';
ALTER TABLE "Apartment" ADD COLUMN "matterportUrl" TEXT;
