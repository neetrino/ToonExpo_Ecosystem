import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';

import { AdminAuditClient } from './admin-audit-client';

type AdminAuditPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminAuditPage({ params }: AdminAuditPageProps) {
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
      <AdminAuditClient />
    </Suspense>
  );
}
