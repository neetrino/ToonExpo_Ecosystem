/*
  Warnings:

  - You are about to drop the column `expires_at` on the `sessions` table. All the data in the column will be lost.
  - Added the required column `absolute_expires_at` to the `sessions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `idle_expires_at` to the `sessions` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX IF EXISTS "sessions_expires_at_idx";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "expires_at",
ADD COLUMN     "absolute_expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "idle_expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "last_seen_at" TIMESTAMP(3),
ADD COLUMN     "revoked_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "PlatformRole" NOT NULL DEFAULT 'buyer';

-- CreateTable
CREATE TABLE "buyer_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buyer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "buyer_profiles_user_id_key" ON "buyer_profiles"("user_id");

-- CreateIndex
CREATE INDEX "sessions_idle_expires_at_idx" ON "sessions"("idle_expires_at");

-- CreateIndex
CREATE INDEX "sessions_absolute_expires_at_idx" ON "sessions"("absolute_expires_at");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- AddForeignKey
ALTER TABLE "buyer_profiles" ADD CONSTRAINT "buyer_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
