import type { BuildingSummary, FloorApartmentSummary } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { BuyApartmentCard } from '@/features/catalog/components/buy-apartment-card';
import type { BuyApartmentListing } from '@/features/catalog/utils/load-buy-apartments';

type ProjectApartmentCardsProps = {
  projectId: string;
  projectName: string;
  city: string | null;
  district: string | null;
  locationText: string | null;
  buildings: BuildingSummary[];
};

type ProjectApartmentCard = FloorApartmentSummary & {
  verified: boolean;
};

/**
 * Public project apartments as the shared buy-page apartment card.
 * The building stays an admin container and is not shown on the web.
 */
export const ProjectApartmentCards = async ({
  projectId,
  projectName,
  city,
  district,
  locationText,
  buildings,
}: ProjectApartmentCardsProps) => {
  const t = await getTranslations('Catalog');
  const apartments = collectProjectApartments(buildings);
  const locationLine = buildLocationLine(city, district, locationText);

  if (apartments.length === 0) {
    return null;
  }

  return (
    <section className="page-container section-pad pt-0">
      <h2 className="mb-4 font-brand text-xl font-semibold text-ink">
        {t('project.apartmentsTitle')}
      </h2>
      <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {apartments.map((apartment) => (
          <li key={apartment.id} className="h-full">
            <BuyApartmentCard
              listing={toProjectApartmentListing(apartment, projectId, projectName, locationLine)}
            />
          </li>
        ))}
      </ul>
    </section>
  );
};

const toProjectApartmentListing = (
  apartment: ProjectApartmentCard,
  projectId: string,
  projectName: string,
  locationLine: string | null,
): BuyApartmentListing => ({
  id: apartment.id,
  slug: apartment.slug,
  title: apartment.number,
  rooms: apartment.rooms,
  bedrooms: apartment.bedrooms,
  bathrooms: apartment.bathrooms,
  areaTotal: apartment.areaTotal,
  price: apartment.price,
  priceCurrency: apartment.priceCurrency,
  priceVisibility: apartment.priceVisibility,
  priceOnRequest: apartment.priceOnRequest,
  salesStatus: apartment.salesStatus,
  locationLine,
  image: apartment.tinder
    ? {
        src: apartment.tinder.fileUrl,
        alt: apartment.tinder.altText ?? projectName,
      }
    : null,
  latitude: null,
  longitude: null,
  projectId,
  projectName,
  verified: apartment.verified,
});

const buildLocationLine = (
  city: string | null,
  district: string | null,
  locationText: string | null,
): string | null => {
  const districtLabel = district?.trim() || null;
  const cityLabel = city?.trim() || null;

  if (districtLabel && cityLabel) {
    return `${districtLabel} · ${cityLabel}`;
  }

  return locationText?.trim() || cityLabel || districtLabel;
};

const collectProjectApartments = (buildings: BuildingSummary[]): ProjectApartmentCard[] =>
  buildings.flatMap((building) =>
    building.floors.flatMap((floor) =>
      floor.apartments.map((apartment) => ({
        ...apartment,
        verified: building.verified,
      })),
    ),
  );
