import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { AdminAnalyticsPage } from "@/features/admin/components/admin-analytics-page";

type AdminAnalyticsRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin analytics dashboard route.
 */
export default async function AdminAnalyticsRoute({
  params,
}: AdminAnalyticsRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <AdminAnalyticsPage />
    </Suspense>
  );
}
