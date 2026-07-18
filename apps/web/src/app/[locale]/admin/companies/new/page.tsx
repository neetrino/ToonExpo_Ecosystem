import { setRequestLocale } from "next-intl/server";

import { NewCompanyPage } from "@/features/admin/components/new-company-page";

type AdminNewCompanyPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminNewCompanyPage({
  params,
}: AdminNewCompanyPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewCompanyPage />;
}
