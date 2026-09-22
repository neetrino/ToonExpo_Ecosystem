import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BuildingRenderPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string; buildingId: string }>;
};

/**
 * Builder phase 3 — building render + floor bands.
 */
export default async function BuilderBuildingRenderMappingPage({ params }: PageProps) {
  const { projectId, buildingId } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <BuildingRenderPhasePage projectId={projectId} buildingId={buildingId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
