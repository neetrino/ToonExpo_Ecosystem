import { setRequestLocale } from "next-intl/server";

import { AdminEventsListPage } from "@/features/exhibition/components/admin/admin-events-list-page";

type AdminEventsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminEventsPage({ params }: AdminEventsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminEventsListPage />;
}
