import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';

import { AdminProjectsClient } from './admin-projects-client';

type AdminProjectsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminProjectsPage({ params }: AdminProjectsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-6 py-16 text-sm text-[var(--te-muted)]" role="status">
          Loading…
        </div>
      }
    >
      <AdminProjectsClient />
    </Suspense>
  );
}
