import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { InteractiveMappingProjectsPage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

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
    <InteractiveMappingScopeRoot mode="admin">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <InteractiveMappingProjectsPage />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
