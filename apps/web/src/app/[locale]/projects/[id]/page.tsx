import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { CatalogFavoritesScope } from '@/features/buyer/components/catalog-favorites-scope';
import { getProject } from '@/features/catalog/api/catalog-api';
import { ProjectDetailView } from '@/features/catalog/components/project-detail-view';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type ProjectPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadProject = cache((id: string, locale: string) => getProject(id, { locale }));

export const generateMetadata = async ({ params }: ProjectPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const project = await loadProject(id, locale);

  if (!project) {
    return { title: t('project.notFoundTitle') };
  }

  return {
    title: project.name,
    description: project.shortDescription ?? t('project.metaFallback', { name: project.name }),
  };
};

/**
 * Public project detail — Figma `89:876`.
 */
export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = await loadProject(id, locale);
  if (!project) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-canvas">
      <CatalogFavoritesScope extraTargets={[{ targetType: 'project', targetId: project.id }]}>
        <ProjectPricesOverlayScope projectId={project.id}>
          <main>
            <ProjectDetailView project={project} />
          </main>
        </ProjectPricesOverlayScope>
      </CatalogFavoritesScope>
      <SiteFooter />
    </div>
  );
}
