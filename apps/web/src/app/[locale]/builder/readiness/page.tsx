import { setRequestLocale } from "next-intl/server";

import { BuilderReadinessPage } from "@/features/builder/components/readiness-page";

type BuilderReadinessRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder portal readiness guidance view.
 */
export default async function BuilderReadinessRoute({
  params,
}: BuilderReadinessRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <BuilderReadinessPage />;
}
