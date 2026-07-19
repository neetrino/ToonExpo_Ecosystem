import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { ProjectsListPage } from '@/features/builder/components/projects-list-page';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Admin company catalog projects list.
 */
export default async function AdminCompanyCatalogProjectsPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <AdminCompanyCatalogShell companyId={id}>
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <ProjectsListPage />
      </Suspense>
    </AdminCompanyCatalogShell>
  );
}
