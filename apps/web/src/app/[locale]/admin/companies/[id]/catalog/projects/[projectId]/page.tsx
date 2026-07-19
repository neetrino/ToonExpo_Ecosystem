import { setRequestLocale } from 'next-intl/server';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { ProjectDetailPage } from '@/features/builder/components/project-detail-page';

type PageProps = {
  params: Promise<{ locale: string; id: string; projectId: string }>;
};

/**
 * Admin project detail / inventory for a company.
 */
export default async function AdminCompanyCatalogProjectDetailPage({ params }: PageProps) {
  const { locale, id, projectId } = await params;
  setRequestLocale(locale);

  return (
    <AdminCompanyCatalogShell companyId={id}>
      <ProjectDetailPage projectId={projectId} />
    </AdminCompanyCatalogShell>
  );
}
