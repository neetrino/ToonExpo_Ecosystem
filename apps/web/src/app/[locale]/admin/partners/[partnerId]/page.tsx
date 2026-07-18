import { setRequestLocale } from "next-intl/server";

import { AdminPartnerDetailPage } from "@/features/admin/components/admin-partner-detail-page";

type AdminPartnerDetailRouteProps = {
  params: Promise<{ locale: string; partnerId: string }>;
};

export default async function AdminPartnerDetailRoute({
  params,
}: AdminPartnerDetailRouteProps) {
  const { locale, partnerId } = await params;
  setRequestLocale(locale);

  return <AdminPartnerDetailPage partnerId={partnerId} />;
}
