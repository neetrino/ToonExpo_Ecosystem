import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { MappingLabPage } from '@/features/interactive-mapping';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Temporary MappingCanvas sandbox for headed QA.
 */
export default async function AdminMappingLabPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <MappingLabPage />
    </Suspense>
  );
}
