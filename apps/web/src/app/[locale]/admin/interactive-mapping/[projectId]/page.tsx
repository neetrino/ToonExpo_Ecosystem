import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { PhaseWizardPage } from '@/features/interactive-mapping';
import { InteractiveMappingScopeRoot } from '@/features/interactive-mapping/components/interactive-mapping-scope-root';

type PageProps = {
  params: Promise<{ locale: string; projectId: string }>;
};

/**
 * 4-phase interactive mapping wizard for a project.
 */
export default async function AdminInteractiveMappingProjectPage({ params }: PageProps) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  return (
    <InteractiveMappingScopeRoot mode="admin">
      <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
        <PhaseWizardPage projectId={projectId} />
      </Suspense>
    </InteractiveMappingScopeRoot>
  );
}
