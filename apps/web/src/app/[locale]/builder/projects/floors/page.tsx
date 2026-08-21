import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BuilderFloorsListPage } from '@/features/builder/components/builder-floors-list-page';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder floors hub under Projects.
 */
export default async function BuilderFloorsPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <BuilderFloorsListPage />
    </Suspense>
  );
}
