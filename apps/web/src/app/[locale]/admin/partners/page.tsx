import { getLocale, setRequestLocale } from "next-intl/server";

import { PartnersListPage } from "@/features/admin/components/partners-list-page";

type AdminPartnersPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPartnersPage({ params }: AdminPartnersPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <PartnersListPage />;
}
