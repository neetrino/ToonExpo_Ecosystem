import { setRequestLocale } from 'next-intl/server';

import { BuilderProjectDetailPage } from '@/features/builder/components/builder-project-detail-page';

type BuilderProjectDetailRouteProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Project detail / inventory management route.
 */
export default async function BuilderProjectDetailRoute({
  params,
}: BuilderProjectDetailRouteProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return <BuilderProjectDetailPage projectId={id} />;
}
