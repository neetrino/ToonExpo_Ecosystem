import { setRequestLocale } from "next-intl/server";

import { ReadinessAssessmentDetailPage } from "@/features/admin/components/readiness-assessment-detail-page";

type AdminReadinessDetailPageProps = {
  params: Promise<{ locale: string; assessmentId: string }>;
};

/**
 * Platform admin readiness assessment detail and evaluation.
 */
export default async function AdminReadinessDetailPage({
  params,
}: AdminReadinessDetailPageProps) {
  const { locale, assessmentId } = await params;
  setRequestLocale(locale);

  return <ReadinessAssessmentDetailPage assessmentId={assessmentId} />;
}
