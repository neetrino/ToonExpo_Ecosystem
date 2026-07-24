import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { AdminCrmBoardPage } from '@/features/admin/components/admin-crm-board-page';

type AdminCrmRouteProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin CRM overview (read-only Kanban).
 */
export default async function AdminCrmRoute({ params }: AdminCrmRouteProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <AdminCrmBoardPage />
    </Suspense>
  );
}
