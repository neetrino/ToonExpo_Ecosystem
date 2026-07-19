import { setRequestLocale } from "next-intl/server";

import { ReadinessCategoriesPage } from "@/features/admin/components/readiness-categories-page";

type AdminReadinessCategoriesPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin readiness category configuration.
 */
export default async function AdminReadinessCategoriesPage({
  params,
}: AdminReadinessCategoriesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ReadinessCategoriesPage />;
}
