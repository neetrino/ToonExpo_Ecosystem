import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { DistrictPhasePage } from '@/features/interactive-mapping';

type PageProps = {
  params: Promise<{ locale: string; projectId: string; districtId: string }>;
};

/**
 * Phase 2 — district plan building mapping.
 */
export default async function AdminDistrictMappingPage({ params }: PageProps) {
  const { locale, projectId, districtId } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <DistrictPhasePage projectId={projectId} districtId={districtId} />
    </Suspense>
  );
}
