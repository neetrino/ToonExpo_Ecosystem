import type {
  ApartmentAvailabilitySummary,
  BuildingSummary,
  FloorApartmentSummary,
  FloorSummary,
} from "@toonexpo/contracts";
import { getLocale, getTranslations } from "next-intl/server";

import { formatCatalogPrice } from "@/features/catalog/utils/format-price";
import { Link } from "@/i18n/navigation";

type BuildingFloorsListProps = {
  projectId: string;
  building: BuildingSummary;
};

/**
 * Floor and apartment list fallback for a building page.
 */
export const BuildingFloorsList = async ({
  projectId,
  building,
}: BuildingFloorsListProps) => {
  const t = await getTranslations("Catalog");
  const locale = await getLocale();

  if (building.floors.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t("building.noFloors")}</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {building.floors.map((floor) => (
        <FloorSection
          key={floor.id}
          projectId={projectId}
          buildingId={building.id}
          floor={floor}
          locale={locale}
          t={t}
        />
      ))}
    </div>
  );
};

type FloorSectionProps = {
  projectId: string;
  buildingId: string;
  floor: FloorSummary;
  locale: string;
  t: Awaited<ReturnType<typeof getTranslations>>;
};

const FloorSection = ({
  projectId,
  buildingId,
  floor,
  locale,
  t,
}: FloorSectionProps) => {
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <Link
          href={`/projects/${projectId}/buildings/${buildingId}/floors/${floor.id}`}
          className="text-sm font-semibold text-ink hover:text-brand"
        >
          {floor.displayLabel ?? t("project.floor", { number: floor.number })}
        </Link>
        <AvailabilityLine
          label={t("availability.summary")}
          availability={floor.availability}
          t={t}
        />
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-background">
        {floor.apartments.map((apartment) => (
          <ApartmentRow key={apartment.id} apartment={apartment} locale={locale} t={t} />
        ))}
      </ul>
    </div>
  );
};

type FloorApartmentsListProps = {
  floor: FloorSummary;
};

/**
 * Apartment list fallback for a floor page.
 */
export const FloorApartmentsList = async ({ floor }: FloorApartmentsListProps) => {
  const t = await getTranslations("Catalog");
  const locale = await getLocale();

  if (floor.apartments.length === 0) {
    return (
      <p className="text-sm text-ink-secondary">{t("floor.noApartments")}</p>
    );
  }

  return (
    <ul className="divide-y divide-border overflow-hidden rounded-sm border border-border bg-background">
      {floor.apartments.map((apartment) => (
        <ApartmentRow key={apartment.id} apartment={apartment} locale={locale} t={t} />
      ))}
    </ul>
  );
};

type Translate = Awaited<ReturnType<typeof getTranslations>>;

const AvailabilityLine = ({
  label,
  availability,
  t,
}: {
  label: string;
  availability: ApartmentAvailabilitySummary;
  t: Translate;
}) => {
  return (
    <p className="text-xs text-ink-secondary">
      {label}: {availability.available}/{availability.total}{" "}
      {t("availability.available").toLowerCase()}
    </p>
  );
};

const ApartmentRow = ({
  apartment,
  locale,
  t,
}: {
  apartment: FloorApartmentSummary;
  locale: string;
  t: Translate;
}) => {
  const price = formatCatalogPrice({
    amount: apartment.price,
    currency: apartment.priceCurrency,
    locale,
    priceVisibility: apartment.priceVisibility,
    onRequestLabel: t("price.onRequest"),
    signInLabel: t("price.signInToSee"),
  });

  return (
    <li>
      <Link
        href={`/apartments/${apartment.id}`}
        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-surface"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="font-medium text-ink">
            {t("apartment.unit", { number: apartment.number })}
          </span>
          <StatusBadge status={apartment.salesStatus} t={t} />
          {apartment.rooms != null ? (
            <span className="text-ink-secondary">
              {t("apartment.rooms", { count: apartment.rooms })}
            </span>
          ) : null}
          {apartment.areaTotal != null ? (
            <span className="text-ink-secondary">
              {t("apartment.area", { area: apartment.areaTotal })}
            </span>
          ) : null}
        </div>
        <span className="font-brand font-semibold text-ink">{price}</span>
      </Link>
    </li>
  );
};

const StatusBadge = ({
  status,
  t,
}: {
  status: FloorApartmentSummary["salesStatus"];
  t: Translate;
}) => {
  const tones: Record<FloorApartmentSummary["salesStatus"], string> = {
    available: "bg-success/15 text-success",
    reserved: "bg-surface-input text-ink-label",
    sold: "bg-border text-ink-muted",
  };

  return (
    <span
      className={`rounded-pill px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${tones[status]}`}
    >
      {t(`status.${status}`)}
    </span>
  );
};
