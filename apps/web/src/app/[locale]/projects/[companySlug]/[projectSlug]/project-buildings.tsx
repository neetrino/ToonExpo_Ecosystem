import type { PublicApartment, PublicBuilding, PublicFloor } from '@toonexpo/contracts';
import type { PublicCanvas } from '@toonexpo/contracts';
import type { ApartmentStatus } from '@toonexpo/domain';

import { ApartmentRequestButton } from '@/components/public-request/public-request-sheet';
import { PublicVisualCanvas } from '@/components/visual-map/public-visual-canvas';
import { Link } from '@/i18n/navigation';
import { formatAreaSqm } from '@/lib/catalog/format-area';
import { formatApartmentPriceCell } from '@/lib/catalog/format-apartment-price-cell';
import {
  buildApartmentAnchorId,
  buildBuildingAnchorId,
  buildFloorAnchorId,
} from '@/lib/visual-map/public-hotspot-href';

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
  priceByRequest: string;
  priceHidden: string;
  priceLoginRequired: string;
};

function statusBadgeClass(status: ApartmentStatus): string {
  return `catalog-badge catalog-badge--${status.toLowerCase()}`;
}

function ApartmentTableRow({
  apartment,
  locale,
  companySlug,
  projectSlug,
  projectId,
  projectName,
  tableLabels,
  statusLabel,
  prefill,
}: {
  apartment: PublicApartment;
  locale: string;
  companySlug: string;
  projectSlug: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabel: string;
  prefill?: RequestPrefill;
}) {
  const detailHref = `/projects/${companySlug}/${projectSlug}/apartments/${apartment.id}`;
  const priceText = formatApartmentPriceCell(apartment, locale, tableLabels);

  return (
    <tr id={buildApartmentAnchorId(apartment.id)}>
      <td>
        <Link href={detailHref} className="catalog-apartment-link">
          {apartment.code}
        </Link>
      </td>
      <td>{apartment.rooms ?? tableLabels.noValue}</td>
      <td>
        {apartment.areaSqm !== null
          ? formatAreaSqm(apartment.areaSqm, locale)
          : tableLabels.noValue}
      </td>
      <td>{priceText}</td>
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
  companySlug,
  projectSlug,
  projectId,
  projectName,
  tableLabels,
  statusLabels,
  prefill,
  floorCanvas,
  floorPlanLabel,
}: {
  floor: PublicFloor;
  locale: string;
  companySlug: string;
  projectSlug: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  prefill?: RequestPrefill;
  floorCanvas?: PublicCanvas;
  floorPlanLabel?: string;
}) {
  return (
    <div className="catalog-floor" id={buildFloorAnchorId(floor.id)}>
      <h4 className="catalog-floor__title">{floor.name}</h4>
      {floorCanvas ? <PublicVisualCanvas canvas={floorCanvas} title={floorPlanLabel} /> : null}
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
                companySlug={companySlug}
                projectSlug={projectSlug}
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
  companySlug,
  projectSlug,
  projectId,
  projectName,
  tableLabels,
  statusLabels,
  prefill,
  floorCanvases,
  floorPlanLabel,
}: {
  building: PublicBuilding;
  locale: string;
  companySlug: string;
  projectSlug: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  prefill?: RequestPrefill;
  floorCanvases: Record<string, PublicCanvas>;
  floorPlanLabel?: string;
}) {
  return (
    <section className="catalog-building" id={buildBuildingAnchorId(building.id)}>
      <h3 className="catalog-building__title">{building.name}</h3>
      {building.floors.map((floor) => (
        <FloorBlock
          key={floor.id}
          floor={floor}
          locale={locale}
          companySlug={companySlug}
          projectSlug={projectSlug}
          projectId={projectId}
          projectName={projectName}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
          prefill={prefill}
          floorCanvas={floorCanvases[floor.id]}
          floorPlanLabel={floorPlanLabel}
        />
      ))}
    </section>
  );
}

type ProjectBuildingsProps = {
  buildings: PublicBuilding[];
  locale: string;
  companySlug: string;
  projectSlug: string;
  projectId: string;
  projectName: string;
  tableLabels: TableLabels;
  statusLabels: Record<ApartmentStatus, string>;
  buildingsLabel: string;
  prefill?: RequestPrefill;
  floorCanvases: Record<string, PublicCanvas>;
  floorPlanLabel?: string;
};

export function ProjectBuildings({
  buildings,
  locale,
  companySlug,
  projectSlug,
  projectId,
  projectName,
  tableLabels,
  statusLabels,
  buildingsLabel,
  prefill,
  floorCanvases,
  floorPlanLabel,
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
          companySlug={companySlug}
          projectSlug={projectSlug}
          projectId={projectId}
          projectName={projectName}
          tableLabels={tableLabels}
          statusLabels={statusLabels}
          prefill={prefill}
          floorCanvases={floorCanvases}
          floorPlanLabel={floorPlanLabel}
        />
      ))}
    </section>
  );
}
