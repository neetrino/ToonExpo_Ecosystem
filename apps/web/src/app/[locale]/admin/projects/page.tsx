import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminProjectsListPage } from '@/features/admin/components/admin-projects-list-page';

type AdminProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform-admin hub for all builder projects.
 */
export default async function AdminProjectsPage({ params }: AdminProjectsPageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <AdminProjectsListPage />
    </Suspense>
  );
}
