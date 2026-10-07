import type { BuildingSummary, FloorApartmentSummary } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import { ApartmentPriceLabel } from '@/features/catalog/components/apartment-price-label';
import { buildApartmentPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';
import { Link } from '@/i18n/navigation';

type ProjectApartmentCardsProps = {
  projectId: string;
  buildings: BuildingSummary[];
};

type ProjectApartmentCard = FloorApartmentSummary & {
  floorLabel: string;
};

/**
 * Public project apartments as cards. The building stays an admin container
 * and is not shown on the web.
 */
export const ProjectApartmentCards = async ({
  projectId,
  buildings,
}: ProjectApartmentCardsProps) => {
  const t = await getTranslations('Catalog');
  const apartments = collectProjectApartments(buildings, (floorNumber) =>
    t('project.floor', { number: floorNumber }),
  );

  if (apartments.length === 0) {
    return null;
  }

  return (
    <section className="page-container section-pad pt-0">
      <h2 className="mb-4 font-brand text-xl font-semibold text-ink">
        {t('project.apartmentsTitle')}
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apartments.map((apartment) => (
          <ProjectApartmentCardItem
            key={apartment.id}
            projectId={projectId}
            apartment={apartment}
            unitLabel={t('apartment.unit', { number: apartment.number })}
            roomsLabel={
              apartment.rooms != null ? t('apartment.rooms', { count: apartment.rooms }) : null
            }
            areaLabel={
              apartment.areaTotal != null
                ? t('apartment.area', { area: apartment.areaTotal })
                : null
            }
            viewLabel={t('project.viewApartment')}
          />
        ))}
      </ul>
    </section>
  );
};

const ProjectApartmentCardItem = ({
  projectId,
  apartment,
  unitLabel,
  roomsLabel,
  areaLabel,
  viewLabel,
}: {
  projectId: string;
  apartment: ProjectApartmentCard;
  unitLabel: string;
  roomsLabel: string | null;
  areaLabel: string | null;
  viewLabel: string;
}) => (
  <li className="flex flex-col gap-3 rounded-md border border-border/80 bg-surface-elevated p-4 shadow-xs">
    <div className="flex flex-col gap-1">
      <p className="font-brand text-base font-semibold text-ink">{unitLabel}</p>
      <p className="text-sm text-ink-secondary">{apartment.floorLabel}</p>
      <ApartmentSpecs roomsLabel={roomsLabel} areaLabel={areaLabel} />
    </div>
    <ApartmentPriceLabel
      apartmentId={apartment.id}
      amount={apartment.price}
      currency={apartment.priceCurrency}
      priceVisibility={apartment.priceVisibility}
      projectId={projectId}
      priceOnRequest={apartment.priceOnRequest}
    />
    <Link
      href={buildApartmentPublicHref(apartment.slug)}
      className="mt-auto inline-flex h-10 items-center justify-center rounded-md bg-brand px-4 text-sm font-semibold text-on-dark transition-colors hover:bg-brand-hover"
    >
      {viewLabel}
    </Link>
  </li>
);

const ApartmentSpecs = ({
  roomsLabel,
  areaLabel,
}: {
  roomsLabel: string | null;
  areaLabel: string | null;
}) => {
  const parts = [roomsLabel, areaLabel].filter((part): part is string => part != null);

  if (parts.length === 0) {
    return null;
  }

  return <p className="text-sm text-ink-secondary">{parts.join(' · ')}</p>;
};

const collectProjectApartments = (
  buildings: BuildingSummary[],
  floorLabel: (floorNumber: number) => string,
): ProjectApartmentCard[] =>
  buildings.flatMap((building) =>
    building.floors.flatMap((floor) =>
      floor.apartments.map((apartment) => ({
        ...apartment,
        floorLabel: floor.displayLabel?.trim() || floorLabel(floor.number),
      })),
    ),
  );
