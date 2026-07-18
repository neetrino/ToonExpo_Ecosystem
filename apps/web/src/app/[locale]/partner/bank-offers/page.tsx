import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { PartnerBankOffersPage } from "@/features/partner/components/partner-bank-offers-page";
import { getPortalPartner } from "@/features/partner/api/portal-partner-api";
import { isApiErrorStatus } from "@/shared/api/errors";

type PartnerBankOffersRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerBankOffersRoute({
  params,
}: PartnerBankOffersRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const headerStore = await headers();
  const cookieHeader = headerStore.get("cookie") ?? undefined;

  try {
    const partner = await getPortalPartner({ cookieHeader });
    if (partner.type !== "bank") {
      notFound();
    }
  } catch (error) {
    if (isApiErrorStatus(error, 404)) {
      notFound();
    }
    notFound();
  }

  return <PartnerBankOffersPage />;
}
