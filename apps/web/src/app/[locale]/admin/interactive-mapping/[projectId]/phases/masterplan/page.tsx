import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { MasterplanPhasePage } from '@/features/interactive-mapping';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Phase 1 — masterplan district mapping.
 */
export default async function AdminMasterplanMappingPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <MasterplanPhasePage projectId={projectId} />
    </Suspense>
  );
}
