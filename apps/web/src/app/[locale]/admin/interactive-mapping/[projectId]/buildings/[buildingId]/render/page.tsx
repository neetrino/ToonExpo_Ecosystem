import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { BuildingRenderPhasePage } from '@/features/interactive-mapping';

type PageProps = {
  params: Promise<{ locale: string; projectId: string; buildingId: string }>;
};

/**
 * Phase 3 — building render floor mapping.
 */
export default async function AdminBuildingRenderMappingPage({ params }: PageProps) {
  const { locale, projectId, buildingId } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <BuildingRenderPhasePage projectId={projectId} buildingId={buildingId} />
    </Suspense>
  );
}
