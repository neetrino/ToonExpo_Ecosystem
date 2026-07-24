import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { ApartmentDetailPage } from '@/features/builder/components/apartment-detail-page';
import { redirect } from '@/i18n/navigation';

type PageProps = {
  params: Promise<{ locale: string; apartmentId: string }>;
  searchParams: Promise<{ companyId?: string }>;
};

/**
 * Admin apartment detail under the Projects hub (requires companyId).
 */
export default async function AdminProjectApartmentPage({ params, searchParams }: PageProps) {
  const { locale, apartmentId } = await params;
  const { companyId } = await searchParams;
  setRequestLocale(locale);

  if (!companyId) {
    redirect({ href: '/admin/projects', locale });
    return null;
  }

  return (
    <AdminCompanyCatalogShell companyId={companyId}>
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <ApartmentDetailPage apartmentId={apartmentId} />
      </Suspense>
    </AdminCompanyCatalogShell>
  );
}
