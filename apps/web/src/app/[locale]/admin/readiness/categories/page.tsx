import { getLocale, setRequestLocale } from "next-intl/server";

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
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <ReadinessCategoriesPage />;
}
