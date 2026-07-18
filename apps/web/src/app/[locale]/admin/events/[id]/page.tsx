import { setRequestLocale } from "next-intl/server";

import { AdminEventDetailPage } from "@/features/exhibition/components/admin/admin-event-detail-page";

type AdminEventDetailRouteProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminEventDetailRoute({
  params,
}: AdminEventDetailRouteProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <AdminEventDetailPage eventId={id} />;
}
