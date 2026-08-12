import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { cache } from 'react';

import { getApartment, getFloor, getProject } from '@/features/catalog/api/catalog-api';
import { ApartmentDetailView } from '@/features/catalog/components/apartment-detail-view';
import { ComparableHomesSection } from '@/features/catalog/components/comparable-homes-section';
import { ProjectPricesOverlayScope } from '@/features/catalog/components/price-overlay-scope';
import { SiteFooter } from '@/features/catalog/components/site-footer';
import { buildApartmentGalleryImages } from '@/features/catalog/utils/build-apartment-gallery-images';
import { loadComparableHomes } from '@/features/catalog/utils/load-comparable-homes';

type ApartmentPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

const loadApartment = cache((id: string, locale: string) => getApartment(id, { locale }));

export const generateMetadata = async ({ params }: ApartmentPageProps): Promise<Metadata> => {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: 'Catalog' });
  const apartment = await loadApartment(id, locale);

  if (!apartment) {
    return { title: t('apartment.notFoundTitle') };
  }

  return {
    title: t('apartment.metaTitle', {
      number: apartment.number,
      project: apartment.project.name,
    }),
    description:
      apartment.description ??
      t('apartment.metaFallback', {
        number: apartment.number,
        project: apartment.project.name,
      }),
  };
};

export default async function ApartmentPage({ params }: ApartmentPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const apartment = await loadApartment(id, locale);
  if (!apartment) {
    notFound();
  }

  const [project, floor] = await Promise.all([
    getProject(apartment.project.id, { locale }),
    getFloor(apartment.floor.id, {
      locale,
      projectId: apartment.project.id,
    }),
  ]);
  const locationLine = buildLocationLine(
    project?.address,
    project?.city,
    project?.district,
    project?.locationText,
  );

  const comparableHomes =
    project != null
      ? await loadComparableHomes({
          project,
          currentApartmentId: apartment.id,
          locale,
          locationLine,
        })
      : [];

  const galleryImages = buildApartmentGalleryImages({
    apartment,
    project,
    floorplan: floor?.floorplan ?? null,
    extraImages: comparableHomes.map((home) => home.image),
  });

  return (
    <div className="min-h-screen bg-canvas">
      <ProjectPricesOverlayScope projectId={apartment.project.id}>
        <main>
          <ApartmentDetailView
            apartment={apartment}
            locationLine={locationLine}
            galleryImages={galleryImages}
            projectType={project?.projectType ?? null}
            district={project?.district ?? null}
          />
          <ComparableHomesSection homes={comparableHomes} />
        </main>
      </ProjectPricesOverlayScope>
      <SiteFooter />
    </div>
  );
}

const buildLocationLine = (
  address: string | null | undefined,
  city: string | null | undefined,
  district: string | null | undefined,
  locationText: string | null | undefined,
): string | null => {
  if (address && city) {
    return `${address}, ${city}`;
  }
  if (locationText) {
    return locationText;
  }
  const parts = [district, city].filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(' · ') : null;
};
