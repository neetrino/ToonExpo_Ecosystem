import { Prisma } from "@toonexpo/db";

/**
 * True when Postgres/Prisma rejected a create due to the open-deal partial unique.
 */
export const isUniqueOpenDealViolation = (error: unknown): boolean => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    return true;
  }

  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("23505") ||
    message.includes("crm_deals_company_buyer_open_key")
  );
};
