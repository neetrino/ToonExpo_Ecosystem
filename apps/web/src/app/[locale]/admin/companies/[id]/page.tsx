import { getLocale, setRequestLocale } from "next-intl/server";

import { CompanyDetailPage } from "@/features/admin/components/company-detail-page";

type AdminCompanyDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function AdminCompanyDetailPage({
  params,
}: AdminCompanyDetailPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <CompanyDetailPage companyId={id} />;
}
