import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { InteractiveMappingProjectsPage } from '@/features/interactive-mapping';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Platform admin interactive mapping project list.
 */
export default async function AdminInteractiveMappingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <InteractiveMappingProjectsPage />
    </Suspense>
  );
}
