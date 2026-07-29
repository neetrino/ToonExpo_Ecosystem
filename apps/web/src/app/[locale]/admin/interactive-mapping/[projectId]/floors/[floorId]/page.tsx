import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { FloorPhasePage } from '@/features/interactive-mapping';

type PageProps = {
  params: Promise<{ locale: string; projectId: string; floorId: string }>;
};

/**
 * Phase 4 — floor plan apartment mapping.
 */
export default async function AdminFloorMappingPage({ params }: PageProps) {
  const { locale, projectId, floorId } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <FloorPhasePage projectId={projectId} floorId={floorId} />
    </Suspense>
  );
}
