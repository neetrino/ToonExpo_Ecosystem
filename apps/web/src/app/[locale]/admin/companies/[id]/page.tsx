import { setRequestLocale } from "next-intl/server";

import { CompanyDetailPage } from "@/features/admin/components/company-detail-page";

type AdminCompanyDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminCompanyDetailPage({
  params,
}: AdminCompanyDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <CompanyDetailPage companyId={id} />;
}
