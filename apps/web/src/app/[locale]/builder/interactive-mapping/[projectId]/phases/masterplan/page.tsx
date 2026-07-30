import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { MasterplanPhasePage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * Builder phase 1 — masterplan district mapping.
 */
export default async function BuilderMasterplanMappingPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="portal">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <MasterplanPhasePage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
