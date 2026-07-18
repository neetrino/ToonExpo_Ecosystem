import { setRequestLocale } from "next-intl/server";

import { NewProjectPage } from "@/features/builder/components/new-project-page";

type BuilderNewProjectPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Create project route.
 */
export default async function BuilderNewProjectPage({
  params,
}: BuilderNewProjectPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NewProjectPage />;
}
