import type { Metadata } from 'next';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getFloor, getProject } from '@/features/catalog/api/catalog-api';
import { FloorApartmentsList } from '@/features/catalog/components/building-floor-lists';
import { CatalogPathBreadcrumb } from '@/features/catalog/components/catalog-path-breadcrumb';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { listFloorVisualCanvases } from '@/features/visual-map/api/public-visual-map-api';
import { PublicVisualMap } from '@/features/visual-map/components/public-visual-map';
import { pickPrimaryVisualCanvas } from '@/features/visual-map/utils/public-visual-map';

type FloorPageProps = {
  params: Promise<{
    locale: string;
    id: string;
    buildingId: string;
    floorId: string;
  }>;
};

const loadFloor = cache((floorId: string, locale: string, projectId: string) =>
  getFloor(floorId, { locale, projectId }),
);

export const generateMetadata = async ({ params }: FloorPageProps): Promise<Metadata> => {
  const { locale, id, floorId } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const floor = await loadFloor(floorId, locale, id);

  if (!floor) {
    return { title: t('floor.notFoundTitle') };
  }

  const floorLabel = floor.displayLabel ?? String(floor.number);
  return {
    title: `${floorLabel} — ${floor.building.name}`,
  };
};

export default async function FloorPage({ params }: FloorPageProps) {
  const { locale, id, buildingId, floorId } = await params;
  setRequestLocale(locale);

  const floor = await loadFloor(floorId, locale, id);

  if (!floor || floor.project.id !== id || floor.building.id !== buildingId) {
    notFound();
  }

  const t = await getTranslations('Catalog');
  const project = await getProject(floor.project.id, { locale });
  const district = project?.district ?? null;
  const visualResponse = await listFloorVisualCanvases(floorId);
  const visualCanvas = pickPrimaryVisualCanvas(visualResponse?.data ?? []);
  const floorLabel =
    floor.displayLabel?.trim() || t('project.floor', { number: floor.number });
  const firstApartment = floor.apartments[0];
  const apartmentShortcut = firstApartment
    ? {
        id: firstApartment.id,
        label: t('apartment.unit', { number: firstApartment.number }),
      }
    : undefined;

  return (
    <div className="min-h-screen bg-canvas">
      <main className="page-container section-pad">
        <CatalogPathBreadcrumb
          ariaLabel={t('apartment.breadcrumb')}
          district={district}
          project={floor.project}
          building={floor.building}
          floor={{ id: floor.id, label: floorLabel }}
          apartment={apartmentShortcut}
          current="floor"
        />

        <div className="mb-6 flex flex-col gap-2">
          <h1 className="text-page-title text-ink">{floorLabel}</h1>
          <p className="text-sm text-ink-secondary">
            {floor.building.name} · {floor.project.name}
          </p>
        </div>

        {floor.floorplan ? (
          <section className="mb-8 overflow-hidden rounded-md border border-border bg-surface-elevated">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-semibold text-ink">{t('floor.floorplanTitle')}</h2>
            </div>
            <div className="relative aspect-[16/10] bg-surface">
              <Image
                src={floor.floorplan.fileUrl}
                alt={floor.floorplan.altText ?? t('floor.floorplanAlt')}
                fill
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, 960px"
              />
            </div>
          </section>
        ) : null}

        {visualCanvas ? (
          <div className="mb-8">
            <PublicVisualMap canvas={visualCanvas} projectId={floor.project.id} />
          </div>
        ) : null}

        <div className="mb-4">
          <h2 className="text-xl font-bold text-ink">{t('floor.apartments')}</h2>
        </div>
        <ProjectPricesOverlayScope projectId={floor.project.id}>
          <FloorApartmentsList projectId={floor.project.id} floor={floor} />
        </ProjectPricesOverlayScope>
      </main>
      <SiteFooter />
    </div>
  );
}
