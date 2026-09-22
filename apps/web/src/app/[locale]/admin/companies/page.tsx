import { getLocale, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { CompaniesListPage } from "@/features/admin/components/companies-list-page";

type AdminCompaniesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminCompaniesPage({
  params,
}: AdminCompaniesPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <CompaniesListPage />
    </Suspense>
  );
}
