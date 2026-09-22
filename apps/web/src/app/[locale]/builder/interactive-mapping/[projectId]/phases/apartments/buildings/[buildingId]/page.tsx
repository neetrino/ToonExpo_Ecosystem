import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { ApartmentsBuildingPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string; buildingId: string }>;
};

/**
 * Builder phase 4 — choose a floor for apartment mapping.
 */
export default async function BuilderApartmentsBuildingMappingPage({ params }: PageProps) {
  const { projectId, buildingId } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <ApartmentsBuildingPhasePage projectId={projectId} buildingId={buildingId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
