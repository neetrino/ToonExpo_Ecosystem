import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { ReadinessAssessmentsListPage } from "@/features/admin/components/readiness-assessments-list-page";

type AdminReadinessPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin readiness assessments list.
 */
export default async function AdminReadinessPage({
  params,
}: AdminReadinessPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <ReadinessAssessmentsListPage />
    </Suspense>
  );
}
