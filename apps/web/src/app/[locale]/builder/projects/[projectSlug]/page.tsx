import { getLocale, setRequestLocale } from 'next-intl/server';

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
  const { projectSlug } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return <BuilderProjectDetailPage projectSlug={projectSlug} />;
}
