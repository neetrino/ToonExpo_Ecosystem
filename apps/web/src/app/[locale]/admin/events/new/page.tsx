import { setRequestLocale } from "next-intl/server";

import { AdminNewEventPage } from "@/features/exhibition/components/admin/admin-new-event-page";

type AdminNewEventPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminNewEventRoutePage({
  params,
}: AdminNewEventPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <AdminNewEventPage />;
}
