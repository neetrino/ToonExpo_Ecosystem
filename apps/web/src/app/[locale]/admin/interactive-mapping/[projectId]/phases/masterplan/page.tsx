import { getLocale, setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { MasterplanPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Phase 1 — masterplan district mapping.
 */
export default async function AdminMasterplanMappingPage({ params }: PageProps) {
  const { projectId } = await params;
  const locale = await getLocale();
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="admin">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <MasterplanPhasePage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
