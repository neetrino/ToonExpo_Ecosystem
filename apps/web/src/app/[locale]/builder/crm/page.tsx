import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { CrmDealsListPage } from "@/features/builder/components/crm-deals-list-page";

type BuilderCrmPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Constructor CRM deals list.
 */
export default async function BuilderCrmPage({ params }: BuilderCrmPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <CrmDealsListPage />
    </Suspense>
  );
}
