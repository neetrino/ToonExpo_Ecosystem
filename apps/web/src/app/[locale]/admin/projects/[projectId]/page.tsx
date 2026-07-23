import { setRequestLocale } from 'next-intl/server';

import { AdminProjectScopeShell } from '@/features/admin/components/admin-project-scope-shell';
import { ProjectDetailPage } from '@/features/builder/components/project-detail-page';

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
      <ProjectDetailPage projectId={projectId} />
    </AdminProjectScopeShell>
  );
}
