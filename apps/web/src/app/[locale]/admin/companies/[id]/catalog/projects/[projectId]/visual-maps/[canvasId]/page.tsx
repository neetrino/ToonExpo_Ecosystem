import { setRequestLocale } from 'next-intl/server';

import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{
    locale: string;
    id: string;
    projectId: string;
    canvasId: string;
  }>;
};

/**
 * Legacy company catalog visual map → admin Projects hub.
 */
export default async function AdminCompanyCatalogVisualMapRedirect({ params }: PageProps) {
  const { locale, projectId, canvasId } = await params;
  setRequestLocale(locale);
  redirect({
    href: `/admin/projects/${projectId}/visual-maps/${canvasId}`,
    locale,
  });
  return null;
}
