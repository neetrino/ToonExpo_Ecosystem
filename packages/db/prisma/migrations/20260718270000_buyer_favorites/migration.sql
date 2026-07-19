-- CreateEnum
CREATE TYPE "favorite_target_type" AS ENUM ('project', 'apartment');

-- CreateTable
CREATE TABLE "buyer_favorites" (
    "id" TEXT NOT NULL,
    "buyer_profile_id" TEXT NOT NULL,
    "target_type" "favorite_target_type" NOT NULL,
    "target_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buyer_favorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_favorites_buyer_profile_id_target_type_target_id_key" ON "buyer_favorites"("buyer_profile_id", "target_type", "target_id");

-- CreateIndex
CREATE INDEX "buyer_favorites_buyer_profile_id_created_at_idx" ON "buyer_favorites"("buyer_profile_id", "created_at");

-- AddForeignKey
ALTER TABLE "buyer_favorites" ADD CONSTRAINT "buyer_favorites_buyer_profile_id_fkey" FOREIGN KEY ("buyer_profile_id") REFERENCES "buyer_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
