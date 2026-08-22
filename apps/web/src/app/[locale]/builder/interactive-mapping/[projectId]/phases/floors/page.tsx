import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { FloorsPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Builder phase 3 — choose a building for floor mapping.
 */
export default async function BuilderFloorsMappingPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <FloorsPhasePage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
