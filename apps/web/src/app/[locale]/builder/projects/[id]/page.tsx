import { setRequestLocale } from "next-intl/server";

import { ProjectDetailPage } from "@/features/builder/components/project-detail-page";

type BuilderProjectDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Project detail / inventory management route.
 */
export default async function BuilderProjectDetailPage({
  params,
}: BuilderProjectDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <ProjectDetailPage projectId={id} />;
}
