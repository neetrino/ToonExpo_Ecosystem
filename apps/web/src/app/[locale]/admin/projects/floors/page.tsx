import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminFloorsListPage } from '@/features/admin/components/admin-floors-list-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin floors hub under Projects.
 */
export default async function AdminFloorsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <AdminFloorsListPage />
    </Suspense>
  );
}
