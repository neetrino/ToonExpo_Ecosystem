import { setRequestLocale } from "next-intl/server";

import { BuilderDashboardPage } from "@/features/builder/components/builder-dashboard-page";

type BuilderIndexPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder portal dashboard.
 */
export default async function BuilderIndexPage({
  params,
}: BuilderIndexPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BuilderDashboardPage />;
}
