import { setRequestLocale } from 'next-intl/server';

import { AdminProjectDetailPage as AdminProjectDetailView } from '@/features/admin/components/admin-project-detail-page';
import { AdminProjectScopeShell } from '@/features/admin/components/admin-project-scope-shell';

type PageProps = {
  params: Promise<{ locale: string; projectSlug: string }>;
};

/**
 * Admin project detail under the Projects hub (slug in URL).
 */
export default async function AdminProjectDetailPage({ params }: PageProps) {
  const { locale, projectSlug } = await params;
  setRequestLocale(locale);

  return (
    <AdminProjectScopeShell projectSlug={projectSlug}>
      <AdminProjectDetailView />
    </AdminProjectScopeShell>
  );
}
