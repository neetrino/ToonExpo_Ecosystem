import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BuildingsPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Builder phase 2 — choose a district before mapping buildings.
 */
export default async function BuilderBuildingsMappingPage({ params }: PageProps) {
  const { projectId } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <BuildingsPhasePage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
