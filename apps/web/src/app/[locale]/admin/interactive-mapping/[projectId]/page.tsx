import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';

import { PhaseWizardPage } from '@/features/interactive-mapping';

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
    <Suspense fallback={<p className="text-sm text-ink-secondary">…</p>}>
      <PhaseWizardPage projectId={projectId} />
    </Suspense>
  );
}
