-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('buyer', 'platform_admin', 'entrance_staff', 'company_member');

-- CreateEnum
CREATE TYPE "CompanyMemberRole" AS ENUM ('company_admin', 'member');

-- CreateEnum
CREATE TYPE "AccountAccessTokenPurpose" AS ENUM ('set_password', 'invite');

-- AlterEnum
BEGIN;
CREATE TYPE "CompanyType_new" AS ENUM ('builder', 'partner', 'bank', 'service');
ALTER TABLE "companies" ALTER COLUMN "type" TYPE "CompanyType_new" USING ("type"::text::"CompanyType_new");
ALTER TYPE "CompanyType" RENAME TO "CompanyType_old";
ALTER TYPE "CompanyType_new" RENAME TO "CompanyType";
DROP TYPE "public"."CompanyType_old";
COMMIT;

-- DropIndex
DROP INDEX "company_members_company_id_user_id_key";

-- DropIndex
DROP INDEX "company_members_user_id_idx";

-- DropIndex
DROP INDEX "users_role_idx";

-- AlterTable
ALTER TABLE "company_members" DROP COLUMN "role",
ADD COLUMN     "role" "CompanyMemberRole" NOT NULL;

-- AlterTable
ALTER TABLE "users" DROP COLUMN "role",
ADD COLUMN     "account_type" "AccountType" NOT NULL DEFAULT 'buyer';

-- DropEnum
DROP TYPE "PlatformRole";

-- CreateTable
CREATE TABLE "account_access_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "purpose" "AccountAccessTokenPurpose" NOT NULL,
    "token_hash" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "account_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "account_access_tokens_token_hash_key" ON "account_access_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "account_access_tokens_user_id_idx" ON "account_access_tokens"("user_id");

-- CreateIndex
CREATE INDEX "account_access_tokens_expires_at_idx" ON "account_access_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "company_members_user_id_key" ON "company_members"("user_id");

-- CreateIndex
CREATE INDEX "company_members_company_id_idx" ON "company_members"("company_id");

-- CreateIndex
CREATE INDEX "company_members_role_idx" ON "company_members"("role");

-- CreateIndex
CREATE INDEX "users_account_type_idx" ON "users"("account_type");

-- AddForeignKey
ALTER TABLE "account_access_tokens" ADD CONSTRAINT "account_access_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
