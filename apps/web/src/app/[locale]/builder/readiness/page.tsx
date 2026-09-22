import { getLocale, setRequestLocale } from "next-intl/server";

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
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <BuilderReadinessPage />;
}
