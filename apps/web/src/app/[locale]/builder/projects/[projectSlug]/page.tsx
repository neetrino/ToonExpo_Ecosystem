import { setRequestLocale } from 'next-intl/server';

import { BuilderProjectDetailPage } from '@/features/builder/components/builder-project-detail-page';

type BuilderProjectDetailRouteProps = {
  params: Promise<{ locale: string; projectSlug: string }>;
};

/**
 * Project detail / inventory management route (slug in URL).
 */
export default async function BuilderProjectDetailRoute({
  params,
}: BuilderProjectDetailRouteProps) {
  const { locale, projectSlug } = await params;
  setRequestLocale(locale);

  return <BuilderProjectDetailPage projectSlug={projectSlug} />;
}
