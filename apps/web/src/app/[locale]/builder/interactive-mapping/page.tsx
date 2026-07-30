import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { InteractiveMappingProjectsPage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Builder interactive mapping — own company projects only.
 */
export default async function BuilderInteractiveMappingPage({ params }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <InteractiveMappingProjectsPage />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
