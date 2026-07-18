import { setRequestLocale } from "next-intl/server";

import { PartnerProfilePage } from "@/features/partner/components/partner-profile-page";

type PartnerPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PartnerPage({ params }: PartnerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <PartnerProfilePage />;
}
