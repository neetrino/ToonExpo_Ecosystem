import type { Metadata } from 'next';
import type { BuildingDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getBuilding, getProject } from '@/features/catalog/api/catalog-api';
import { BuildingFloorsList } from '@/features/catalog/components/building-floor-lists';
import { CatalogPathBreadcrumb } from '@/features/catalog/components/catalog-path-breadcrumb';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { listBuildingVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import { pickPrimaryVisualCanvas } from '@/features/visual-map/utils/public-visual-map';

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
  const project = await getProject(building.project.id, { locale });
  const district = project?.district ?? null;
  const visualResponse = await listBuildingVisualCanvases(buildingId);
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);
  const pathShortcut = pickBuildingPathShortcut(building.floors, (floorNumber) =>
    t('project.floor', { number: floorNumber }),
    (apartmentNumber) => t('apartment.unit', { number: apartmentNumber }),
  );

  const pathBreadcrumb = (
    <CatalogPathBreadcrumb
      ariaLabel={t('apartment.breadcrumb')}
      district={district}
      project={building.project}
      building={{ id: building.id, name: building.name }}
      floor={pathShortcut?.floor}
      apartment={pathShortcut?.apartment}
      current="building"
    />
  );

  return (
    <div className="min-h-screen bg-canvas">
      <main>
        {building.cover ? (
          <section className="relative isolate h-[min(52vh,28rem)] w-full overflow-hidden bg-surface">
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
              <h1 className="font-brand text-2xl font-bold text-on-dark sm:text-3xl">
                {building.name}
              </h1>
              {building.verified ? (
                <p className="mt-2 text-[10px] font-bold tracking-widest text-on-dark/90 uppercase">
                  {t('badges.verified')}
                </p>
              ) : null}
              <p className="mt-1 text-sm text-on-dark/80">{building.project.name}</p>
            </div>
          </section>
        ) : (
          <div className="page-container pt-8">
            {pathBreadcrumb}
            <h1 className="font-brand text-2xl font-bold text-ink">{building.name}</h1>
            {building.verified ? (
              <p className="mt-1 text-[10px] font-bold tracking-widest text-brand-deep uppercase">
                {t('badges.verified')}
              </p>
            ) : null}
            <p className="text-sm text-ink-secondary">{building.project.name}</p>
          </div>
        )}

        <div className="page-container section-pad">
          {building.cover ? pathBreadcrumb : null}

          {visualCanvas ? (
            <div className="mb-8">
              <PublicVisualMap canvas={visualCanvas} projectId={building.project.id} />
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

const pickBuildingPathShortcut = (
  floors: BuildingDetail['floors'],
  formatFloor: (floorNumber: number) => string,
  formatApartment: (apartmentNumber: string) => string,
): {
  floor: { id: string; label: string };
  apartment?: { id: string; label: string };
} | null => {
  const floor = floors[0];
  if (!floor) {
    return null;
  }

  const apartment = floor.apartments[0];
  return {
    floor: {
      id: floor.id,
      label: floor.displayLabel?.trim() || formatFloor(floor.number),
    },
    ...(apartment
      ? {
          apartment: {
            id: apartment.id,
            label: formatApartment(apartment.number),
          },
        }
      : {}),
  };
};
