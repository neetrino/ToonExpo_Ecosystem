import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminApartmentsListPage } from '@/features/admin/components/admin-apartments-list-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin apartments hub under Projects.
 */
export default async function AdminApartmentsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <AdminApartmentsListPage />
    </Suspense>
  );
}
