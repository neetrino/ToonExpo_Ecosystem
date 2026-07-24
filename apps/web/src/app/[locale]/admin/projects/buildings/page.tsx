import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminBuildingsListPage } from '@/features/admin/components/admin-buildings-list-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Admin buildings hub under Projects.
 */
export default async function AdminBuildingsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <AdminBuildingsListPage />
    </Suspense>
  );
}
