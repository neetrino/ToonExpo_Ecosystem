import type { PublicApartment, PublicBuilding, PublicFloor } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';

import { ApartmentRequestButton } from '@/components/public-request/public-request-sheet';
import { formatAreaSqm } from '@/lib/catalog/format-area';
import { formatPriceAmd } from '@/lib/catalog/format-price';

type RequestPrefill = {
  name?: string;
  email?: string;
  phone?: string;
};

type TableLabels = {
  code: string;
  rooms: string;
  areaSqm: string;
  priceAmd: string;
  status: string;
  request: string;
  noValue: string;
};

function statusBadgeClass(status: ApartmentStatus): string {
  return `catalog-badge catalog-badge--${status.toLowerCase()}`;
}

function ApartmentTableRow({
  apartment,
  locale,
  projectId,
  projectName,
  tableLabels,
  statusLabel,
  prefill,
}: {
  apartment: PublicApartment;
  locale: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabel: string;
  prefill?: RequestPrefill;
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
      <td>
        <ApartmentRequestButton
          locale={locale}
          projectId={projectId}
          projectName={projectName}
          apartmentId={apartment.id}
          apartmentCode={apartment.code}
          prefill={prefill}
        />
      </td>
    </tr>
  );
}

function FloorBlock({
  floor,
  locale,
  projectId,
  projectName,
  tableLabels,
  statusLabels,
  prefill,
}: {
  floor: PublicFloor;
  locale: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  prefill?: RequestPrefill;
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
              <th>{tableLabels.request}</th>
            </tr>
          </thead>
          <tbody>
            {floor.apartments.map((apartment) => (
              <ApartmentTableRow
                key={apartment.id}
                apartment={apartment}
                locale={locale}
                projectId={projectId}
                projectName={projectName}
                tableLabels={tableLabels}
                statusLabel={statusLabels[apartment.status]}
                prefill={prefill}
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
  projectId,
  projectName,
  tableLabels,
  statusLabels,
  prefill,
}: {
  building: PublicBuilding;
  locale: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  prefill?: RequestPrefill;
}) {
  return (
    <section className="catalog-building">
      <h3 className="catalog-building__title">{building.name}</h3>
      {building.floors.map((floor) => (
        <FloorBlock
          key={floor.id}
          floor={floor}
          locale={locale}
          projectId={projectId}
          projectName={projectName}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
          prefill={prefill}
        />
      ))}
    </section>
  );
}

type ProjectBuildingsProps = {
  buildings: PublicBuilding[];
  locale: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  buildingsLabel: string;
  prefill?: RequestPrefill;
};

export function ProjectBuildings({
  buildings,
  locale,
  projectId,
  projectName,
  tableLabels,
  statusLabels,
  buildingsLabel,
  prefill,
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
          projectId={projectId}
          projectName={projectName}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
          prefill={prefill}
        />
      ))}
    </section>
  );
}
