import { setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { TeamPage } from "@/features/builder/components/team-page";

type BuilderTeamPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Company team management route.
 */
export default async function BuilderTeamPage({
  params,
}: BuilderTeamPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <TeamPage />
    </Suspense>
  );
}
