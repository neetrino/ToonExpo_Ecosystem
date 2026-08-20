import { setRequestLocale } from 'next-intl/server';

import { AdminProjectDetailPage as AdminProjectDetailView } from '@/features/admin/components/admin-project-detail-page';
import { AdminProjectScopeShell } from '@/features/admin/components/admin-project-scope-shell';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Admin project detail under the Projects hub.
 */
export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <AdminProjectScopeShell projectId={projectId}>
      <AdminProjectDetailView projectId={projectId} />
    </AdminProjectScopeShell>
  );
}
