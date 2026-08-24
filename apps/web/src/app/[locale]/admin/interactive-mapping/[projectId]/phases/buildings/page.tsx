import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BuildingsPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Phase 2 — choose a district before mapping buildings.
 */
export default async function AdminBuildingsMappingPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="admin">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <BuildingsPhasePage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
