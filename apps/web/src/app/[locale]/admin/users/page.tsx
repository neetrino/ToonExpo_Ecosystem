import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { UsersListPage } from '@/features/admin/components/users-list-page';

type AdminUsersPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin users directory.
 */
export default async function AdminUsersPage({ params }: AdminUsersPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <UsersListPage />
    </Suspense>
  );
}
