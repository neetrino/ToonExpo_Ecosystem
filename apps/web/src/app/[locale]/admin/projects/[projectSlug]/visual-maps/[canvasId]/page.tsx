import { getLocale, setRequestLocale } from 'next-intl/server';

import { AdminProjectScopeShell } from '@/features/admin/components/admin-project-scope-shell';
import { AdminProjectVisualMapView } from '@/features/admin/components/admin-project-visual-map-view';

type PageProps = {
  params: Promise<{
    locale: string;
    projectSlug: string;
    canvasId: string;
  }>;
};

/**
 * Admin visual map editor under the Projects hub (slug in URL).
 */
export default async function AdminProjectVisualMapPage({ params }: PageProps) {
  const { projectSlug, canvasId } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <AdminProjectScopeShell projectSlug={projectSlug}>
      <AdminProjectVisualMapView canvasId={canvasId} />
    </AdminProjectScopeShell>
  );
}
