import { setRequestLocale } from 'next-intl/server';

import { AdminCompanyCatalogShell } from '@/features/admin/components/admin-company-catalog-shell';
import { ApartmentDetailPage } from '@/features/builder/components/apartment-detail-page';

type PageProps = {
  params: Promise<{ locale: string; id: string; apartmentId: string }>;
};

/**
 * Admin apartment detail for a company catalog.
 */
export default async function AdminCompanyCatalogApartmentPage({ params }: PageProps) {
  const { locale, id, apartmentId } = await params;
  setRequestLocale(locale);

  return (
    <AdminCompanyCatalogShell companyId={id}>
      <ApartmentDetailPage apartmentId={apartmentId} />
    </AdminCompanyCatalogShell>
  );
}
