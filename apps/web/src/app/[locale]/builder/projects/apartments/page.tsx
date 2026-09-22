import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BuilderApartmentsListPage } from '@/features/builder/components/builder-apartments-list-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder apartments hub under Projects.
 */
export default async function BuilderApartmentsPage({ params }: PageProps) {
  await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <BuilderApartmentsListPage />
    </Suspense>
  );
}
