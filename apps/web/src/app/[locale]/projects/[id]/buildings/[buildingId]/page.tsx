import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { BuildingFloorsList } from '@/features/catalog/components/building-floor-lists';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { getBuilding } from '@/features/catalog/api/catalog-api';
import { listBuildingVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import {
  buildBuildingFloorHref,
  pickPrimaryVisualCanvas,
} from '@/features/visual-map/utils/public-visual-map';
import { Link } from '@/i18n/navigation';
import { SiteHeader } from '@/shared/ui/site-header';
import { SiteFooter } from '@/features/catalog/components/site-footer';

type BuildingPageProps = {
  params: Promise<{ locale: string; id: string; buildingId: string }>;
};

const loadBuilding = cache((buildingId: string, locale: string, projectId: string) =>
  getBuilding(buildingId, { locale, projectId }),
);

export const generateMetadata = async ({ params }: BuildingPageProps): Promise<Metadata> => {
  const { locale, id, buildingId } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const building = await loadBuilding(buildingId, locale, id);

  if (!building) {
    return { title: t('building.notFoundTitle') };
  }

  return {
    title: `${building.name} — ${building.project.name}`,
  };
};

export default async function BuildingPage({ params }: BuildingPageProps) {
  const { locale, id, buildingId } = await params;
  setRequestLocale(locale);

  const building = await loadBuilding(buildingId, locale, id);

  if (!building || building.project.id !== id) {
    notFound();
  }

  const t = await getTranslations('Catalog');
  const visualResponse = await listBuildingVisualCanvases(buildingId);
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        {building.cover ? (
          <section className="relative isolate h-[min(40vh,320px)] w-full overflow-hidden bg-surface">
            <Image
              src={building.cover.fileUrl}
              alt={building.cover.altText ?? building.name}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/25 to-transparent" />
            <div className="page-container absolute inset-x-0 bottom-0 pb-6">
              <Link
                href={`/projects/${building.project.id}`}
                className="text-sm text-on-dark/80 transition-colors hover:text-on-dark"
              >
                {t('building.backToProject')}
              </Link>
              <h1 className="mt-2 font-brand text-2xl font-bold text-on-dark sm:text-3xl">
                {building.name}
              </h1>
              <p className="mt-1 text-sm text-on-dark/80">{building.project.name}</p>
            </div>
          </section>
        ) : (
          <div className="page-container pt-10">
            <Link
              href={`/projects/${building.project.id}`}
              className="text-sm text-ink-secondary hover:text-ink"
            >
              {t('building.backToProject')}
            </Link>
            <h1 className="mt-2 font-brand text-2xl font-bold text-ink">{building.name}</h1>
            <p className="text-sm text-ink-secondary">{building.project.name}</p>
          </div>
        )}

        <div className="page-container section-pad">
          {visualCanvas ? (
            <div className="mb-8">
              <PublicVisualMap
                canvas={visualCanvas}
                buildTargetHref={(hotspot) =>
                  buildBuildingFloorHref(building.project.id, building.id, hotspot)
                }
              />
            </div>
          ) : null}

          <div className="mb-4">
            <h2 className="text-section-title text-ink">{t('building.floors')}</h2>
          </div>
          <ProjectPricesOverlayScope projectId={building.project.id}>
            <BuildingFloorsList projectId={building.project.id} building={building} />
          </ProjectPricesOverlayScope>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
