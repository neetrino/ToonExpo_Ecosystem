import { setRequestLocale } from "next-intl/server";

import { PartnerOffersPage } from "@/features/partner/components/partner-offers-page";

type PartnerOffersRouteProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerOffersRoute({
  params,
}: PartnerOffersRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PartnerOffersPage />;
}
