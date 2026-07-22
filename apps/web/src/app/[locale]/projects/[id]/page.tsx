import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getProject } from '@/features/catalog/api/catalog-api';
import { ProjectDetailFavorite } from '@/features/buyer/components/project-detail-favorite';
import { ProjectBuildings } from '@/features/catalog/components/project-buildings';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { ProjectPriceText } from '@/features/catalog/components/project-price-text';
import { RequestPriceButton } from '@/features/catalog/components/request-price-button';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { listProjectVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import {
  buildHotspotTargetHrefs,
  buildProjectBuildingHref,
  pickPrimaryVisualCanvas,
} from '@/features/visual-map/utils/public-visual-map';
import { Link } from '@/i18n/navigation';

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

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const project = await loadProject(id, locale);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('Catalog');
  const visualResponse = await listProjectVisualCanvases(id);
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);
  const location =
    project.locationText ?? [project.district, project.city].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-background">
      <ProjectPricesOverlayScope projectId={project.id}>
        <main>
          <section className="relative isolate h-[min(58vh,520px)] w-full overflow-hidden bg-surface">
            {project.cover ? (
              <Image
                src={project.cover.fileUrl}
                alt={project.cover.altText ?? project.name}
                fill
                priority
                className="object-cover"
                sizes="100vw"
              />
            ) : null}
            <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/15" />
            <ProjectDetailFavorite projectId={project.id} />
            <div className="page-container absolute inset-x-0 bottom-0 pb-8 sm:pb-10">
              <div className="flex items-center gap-2">
                {project.builder.logoUrl ? (
                  <span className="relative size-7 shrink-0 overflow-hidden rounded-sm border border-white/30 bg-white/90">
                    <Image
                      src={project.builder.logoUrl}
                      alt={project.builder.name}
                      fill
                      className="object-cover"
                      sizes="28px"
                    />
                  </span>
                ) : null}
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-dark/75">
                  {project.builder.name}
                  {location ? ` · ${location}` : null}
                </p>
              </div>
              <h1 className="mt-2 font-brand text-[clamp(1.75rem,4vw,2.75rem)] font-bold tracking-tight text-on-dark">
                {project.name}
              </h1>
              <p className="mt-2 text-base font-medium text-on-dark/90">
                <ProjectPriceText
                  projectId={project.id}
                  minPrice={project.minPrice}
                  maxPrice={project.maxPrice}
                  priceCurrency={project.priceCurrency}
                  variant="from"
                />
              </p>
            </div>
          </section>

          <div className="page-container section-pad">
            <div className="mb-8 grid gap-3 rounded-md border border-border/80 bg-surface-elevated p-4 shadow-xs sm:grid-cols-4 sm:p-6">
              <Stat label={t('availability.total')} value={project.availability.total} />
              <Stat label={t('availability.available')} value={project.availability.available} />
              <Stat label={t('availability.reserved')} value={project.availability.reserved} />
              <Stat label={t('availability.sold')} value={project.availability.sold} />
            </div>

            <div className="mb-10 max-w-3xl">
              <h2 className="text-section-title text-ink">{t('project.about')}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
                {project.fullDescription ?? project.shortDescription ?? t('project.noDescription')}
              </p>
              <p className="mt-4 text-sm text-ink">
                <span className="font-medium">{t('project.priceRange')}: </span>
                <ProjectPriceText
                  projectId={project.id}
                  minPrice={project.minPrice}
                  maxPrice={project.maxPrice}
                  priceCurrency={project.priceCurrency}
                  variant="range"
                />
              </p>
              {project.address ? (
                <p className="mt-2 text-sm text-ink-secondary">{project.address}</p>
              ) : null}
              <div className="mt-6">
                <RequestPriceButton projectId={project.id} labelKey="requestInfo" />
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between gap-4">
              <h2 className="text-section-title text-ink">{t('project.units')}</h2>
              <Link
                href="/projects"
                className="text-sm font-semibold text-ink transition-colors hover:text-brand"
              >
                {t('actions.backToProjects')}
              </Link>
            </div>

            {visualCanvas ? (
              <PublicVisualMap
                canvas={visualCanvas}
                targetHrefByHotspotId={buildHotspotTargetHrefs(visualCanvas.hotspots, (hotspot) =>
                  buildProjectBuildingHref(project.id, hotspot),
                )}
              />
            ) : null}

            <ProjectBuildings projectId={project.id} buildings={project.buildings} />
          </div>
        </main>
      </ProjectPricesOverlayScope>
      <SiteFooter />
    </div>
  );
}

const Stat = ({ label, value }: { label: string; value: number }) => {
  return (
    <div className="rounded-sm bg-surface px-3 py-4 text-center">
      <p className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">{label}</p>
      <p className="mt-1 font-brand text-2xl font-bold text-ink">{value}</p>
    </div>
  );
};
