import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { ApartmentsPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Builder phase 4 — choose a building for apartment mapping.
 */
export default async function BuilderApartmentsMappingPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <ApartmentsPhasePage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
