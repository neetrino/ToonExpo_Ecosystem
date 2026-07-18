import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { ProjectsListPage } from "@/features/builder/components/projects-list-page";

type BuilderProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder projects list route.
 */
export default async function BuilderProjectsPage({
  params,
}: BuilderProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <ProjectsListPage />
    </Suspense>
  );
}
