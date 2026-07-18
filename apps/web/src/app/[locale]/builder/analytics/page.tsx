import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { BuilderAnalyticsPage } from "@/features/builder/components/builder-analytics-page";

type BuilderAnalyticsRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder portal analytics dashboard route.
 */
export default async function BuilderAnalyticsRoute({
  params,
}: BuilderAnalyticsRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <BuilderAnalyticsPage />
    </Suspense>
  );
}
