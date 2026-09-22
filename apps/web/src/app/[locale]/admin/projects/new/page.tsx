import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { NewProjectPage } from '@/features/builder/components/new-project-page';
import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ companyId?: string }>;
};

/**
 * Admin create-project under the Projects hub (requires companyId).
 */
export default async function AdminNewProjectPage({ params, searchParams }: PageProps) {
  const { locale: urlLocale } = await params;
  const { companyId } = await searchParams;
  const locale = await getLocale();
  setRequestLocale(locale);

  if (!companyId) {
    redirect({ href: '/admin/projects', locale: urlLocale });
    return null;
  }

  return (
    <AdminCompanyCatalogShell companyId={companyId}>
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <NewProjectPage />
      </Suspense>
    </AdminCompanyCatalogShell>
  );
}
