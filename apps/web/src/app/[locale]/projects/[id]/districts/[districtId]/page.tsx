import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getProject } from '@/features/catalog/api/catalog-api';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { ensureCanonicalProjectSlug } from '@/features/catalog/utils/ensure-canonical-project-slug';
import { buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';
import { listDistrictVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import { pickPrimaryVisualCanvas } from '@/features/visual-map/utils/public-visual-map';
import { BackLink } from '@/shared/ui/back-link';

type DistrictPageProps = {
  params: Promise<{ locale: string; id: string; districtId: string }>;
};

const loadProject = cache((projectSlug: string, locale: string) => getProject(projectSlug, { locale }));

export const generateMetadata = async ({ params }: DistrictPageProps): Promise<Metadata> => {
  const { locale, districtId } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const visualResponse = await listDistrictVisualCanvases(districtId);
  const canvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);

  if (!visualResponse) {
    return { title: t('district.notFoundTitle') };
  }

  return {
    title: canvas?.title ?? t('district.fallbackTitle'),
  };
};

/**
 * Public district map stage — refresh-safe path for masterplan district polygons.
 */
export default async function DistrictPage({ params }: DistrictPageProps) {
  const { locale, id: projectSlug, districtId } = await params;
  setRequestLocale(locale);

  const project = await loadProject(projectSlug, locale);
  if (!project) {
    notFound();
  }

  ensureCanonicalProjectSlug(project, projectSlug, locale, `/districts/${districtId}`);

  const t = await getTranslations('Catalog');
  const visualResponse = await listDistrictVisualCanvases(districtId);

  if (!visualResponse) {
    notFound();
  }

  const visualCanvas = pickPrimaryVisualCanvas(visualResponse.data);
  const title = visualCanvas?.title ?? t('district.fallbackTitle');

  return (
    <div className="min-h-screen bg-canvas">
      <main className="page-container section-pad">
        <div className="mb-6 flex flex-col gap-2">
          <BackLink href={buildProjectPublicHref(project.slug)} label={t('district.backToProject')} />
          <h1 className="text-page-title text-ink">{title}</h1>
        </div>

        {visualCanvas ? (
          <PublicVisualMap
            canvas={visualCanvas}
            projectId={project.id}
            projectSlug={project.slug}
          />
        ) : (
          <p className="text-sm text-ink-secondary">{t('visualMap.stageUnavailable')}</p>
        )}
      </main>
      <SiteFooter />
    </div>
  );
}
