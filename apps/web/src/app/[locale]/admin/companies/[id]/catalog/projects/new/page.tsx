import { setRequestLocale } from 'next-intl/server';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { NewProjectPage } from '@/features/builder/components/new-project-page';

type PageProps = {
  params: Promise<{ locale: string; id: string }>;
};

/**
 * Admin create project for a company.
 */
export default async function AdminCompanyCatalogNewProjectPage({ params }: PageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  return (
    <AdminCompanyCatalogShell companyId={id}>
      <NewProjectPage />
    </AdminCompanyCatalogShell>
  );
}
