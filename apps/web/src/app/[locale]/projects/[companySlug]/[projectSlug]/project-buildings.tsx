import type { PublicApartment, PublicBuilding, PublicFloor } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';

import { formatAreaSqm } from '@/lib/catalog/format-area';
import { formatPriceAmd } from '@/lib/catalog/format-price';

type TableLabels = {
  code: string;
  rooms: string;
  areaSqm: string;
  priceAmd: string;
  status: string;
  noValue: string;
};

function statusBadgeClass(status: ApartmentStatus): string {
  return `catalog-badge catalog-badge--${status.toLowerCase()}`;
}

function ApartmentTableRow({
  apartment,
  locale,
  tableLabels,
  statusLabel,
}: {
  apartment: PublicApartment;
  locale: string;
  tableLabels: TableLabels;
  statusLabel: string;
}) {
  return (
    <tr>
      <td>{apartment.code}</td>
      <td>{apartment.rooms ?? tableLabels.noValue}</td>
      <td>
        {apartment.areaSqm !== null
          ? formatAreaSqm(apartment.areaSqm, locale)
          : tableLabels.noValue}
      </td>
      <td>
        {apartment.priceAmd !== null
          ? formatPriceAmd(apartment.priceAmd, locale)
          : tableLabels.noValue}
      </td>
      <td>
        <span className={statusBadgeClass(apartment.status)}>{statusLabel}</span>
      </td>
    </tr>
  );
}

function FloorBlock({
  floor,
  locale,
  tableLabels,
  statusLabels,
}: {
  floor: PublicFloor;
  locale: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
}) {
  return (
    <div className="catalog-floor">
      <h4 className="catalog-floor__title">{floor.name}</h4>
      <div className="catalog-table-wrap">
        <table className="catalog-table">
          <thead>
            <tr>
              <th>{tableLabels.code}</th>
              <th>{tableLabels.rooms}</th>
              <th>{tableLabels.areaSqm}</th>
              <th>{tableLabels.priceAmd}</th>
              <th>{tableLabels.status}</th>
            </tr>
          </thead>
          <tbody>
            {floor.apartments.map((apartment) => (
              <ApartmentTableRow
                key={apartment.id}
                apartment={apartment}
                locale={locale}
                tableLabels={tableLabels}
                statusLabel={statusLabels[apartment.status]}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BuildingBlock({
  building,
  locale,
  tableLabels,
  statusLabels,
}: {
  building: PublicBuilding;
  locale: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
}) {
  return (
    <section className="catalog-building">
      <h3 className="catalog-building__title">{building.name}</h3>
      {building.floors.map((floor) => (
        <FloorBlock
          key={floor.id}
          floor={floor}
          locale={locale}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
        />
      ))}
    </section>
  );
}

type ProjectBuildingsProps = {
  buildings: PublicBuilding[];
  locale: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  buildingsLabel: string;
};

export function ProjectBuildings({
  buildings,
  locale,
  tableLabels,
  statusLabels,
  buildingsLabel,
}: ProjectBuildingsProps) {
  if (buildings.length === 0) {
    return null;
  }

  return (
    <section className="catalog-buildings">
      <h2 className="catalog-section-title">{buildingsLabel}</h2>
      {buildings.map((building) => (
        <BuildingBlock
          key={building.id}
          building={building}
          locale={locale}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
        />
      ))}
    </section>
  );
}
