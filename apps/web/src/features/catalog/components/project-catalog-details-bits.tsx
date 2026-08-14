import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpFromLine,
  BadgePercent,
  Banknote,
  BedDouble,
  Building2,
  CalendarRange,
  Car,
  Check,
  ClipboardList,
  Droplets,
  Eye,
  Factory,
  FileBadge,
  Flame,
  Fuel,
  HardHat,
  Hash,
  Home,
  Landmark,
  Layers,
  MapPin,
  MapPinned,
  MoveVertical,
  Navigation,
  Paintbrush,
  ParkingCircle,
  PenLine,
  Percent,
  Quote,
  Ruler,
  Shield,
  ShieldCheck,
  Snowflake,
  SquareParking,
  Store,
  Thermometer,
  Trees,
  Warehouse,
} from 'lucide-react';

import type {
  ProjectCatalogCriterionId,
  ProjectCatalogRow,
} from '@/features/catalog/utils/build-project-catalog-rows';
import { cn } from '@/shared/ui/cn';

export const PROJECT_CATALOG_CRITERION_ICON: Record<ProjectCatalogCriterionId, LucideIcon> = {
  slogan: Quote,
  propertyType: Building2,
  country: MapPin,
  city: Home,
  address: Navigation,
  zipCode: Hash,
  brandName: Landmark,
  designer: PenLine,
  contractor: HardHat,
  permitNumber: FileBadge,
  constructionStart: CalendarRange,
  constructionEnd: CalendarRange,
  constructionStatus: ClipboardList,
  partnerBank: Banknote,
  bedroomsCount: BedDouble,
  pricePerSqm: Percent,
  areaRange: Ruler,
  unitPriceRange: Banknote,
  parkingPrice: ParkingCircle,
  parkingAvailable: Car,
  storageAvailable: Warehouse,
  elevator: ArrowUpFromLine,
  elevatorsCount: ArrowUpFromLine,
  constructionType: Factory,
  facadeMaterials: Paintbrush,
  thermalSoundInsulation: Thermometer,
  seismicStandard: Shield,
  totalLandArea: Ruler,
  totalResidentialArea: Home,
  buildingsCount: Building2,
  apartmentsCount: Hash,
  availableApartmentsCount: Hash,
  parkingSpaces: ParkingCircle,
  openParkingSpaces: SquareParking,
  closedParkingSpaces: ParkingCircle,
  parkingStandardSizes: Ruler,
  ceilingHeight: MoveVertical,
  floorsCount: Layers,
  heating: Flame,
  cooling: Snowflake,
  hotWater: Droplets,
  gas: Fuel,
  schoolDistance: MapPin,
  kindergartenDistance: MapPin,
  commercialAreaSqm: Ruler,
  distanceExtra: MapPin,
  economicZone: Store,
  subsidizedPrograms: BadgePercent,
  finishingStatus: Paintbrush,
  services: ClipboardList,
  paymentTypes: Banknote,
  installmentTerms: ClipboardList,
  mortgageTerms: Banknote,
  specialTermsAvailable: ShieldCheck,
  specialTerms: ShieldCheck,
  incomeTaxRefund: Banknote,
  handoverDescription: ClipboardList,
  greenZones: Trees,
  territorialAdvantages: MapPinned,
  views: Eye,
};

export const ProjectCatalogOverviewStat = ({ row }: { row: ProjectCatalogRow }) => {
  const Icon = PROJECT_CATALOG_CRITERION_ICON[row.id];

  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className="flex size-11 items-center justify-center rounded-full bg-brand-soft text-brand-deep"
        aria-hidden
      >
        <Icon className="size-5" strokeWidth={1.75} />
      </span>
      <dd className="text-base font-bold text-ink-navy sm:text-lg">{row.value}</dd>
      <dt className="text-xs font-medium text-ink-muted">{row.label}</dt>
    </div>
  );
};

const DETAIL_ROW_PAIR: Partial<Record<ProjectCatalogCriterionId, ProjectCatalogCriterionId>> = {
  constructionStart: 'constructionEnd',
  elevator: 'elevatorsCount',
  permitNumber: 'constructionType',
};

const ProjectCatalogDetailRow = ({ row }: { row: ProjectCatalogRow }) => {
  const Icon = PROJECT_CATALOG_CRITERION_ICON[row.id];
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 border-b border-header-border py-3',
        row.wide && 'sm:col-span-2 sm:flex-col sm:items-stretch sm:gap-1',
      )}
    >
      <dt className="flex shrink-0 items-start gap-2 text-sm text-ink-muted">
        <Icon className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
        {row.label}
      </dt>
      <dd
        className={cn(
          'min-w-0 text-sm font-semibold whitespace-pre-line text-ink-navy',
          row.wide ? 'text-left' : 'text-right',
        )}
      >
        {row.value}
      </dd>
    </div>
  );
};

export const ProjectCatalogDetailsList = ({ rows }: { rows: ProjectCatalogRow[] }) => {
  const byId = new Map(rows.map((row) => [row.id, row]));
  const rendered = new Set<string>();

  return (
    <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
      {rows.map((row) => {
        if (rendered.has(row.id)) {
          return null;
        }
        const partnerId = DETAIL_ROW_PAIR[row.id];
        const partner = partnerId ? byId.get(partnerId) : undefined;
        rendered.add(row.id);
        if (partner) {
          rendered.add(partner.id);
          return (
            <div
              key={`pair-${row.id}`}
              className="grid grid-cols-1 gap-x-10 sm:col-span-2 sm:grid-cols-2"
            >
              <ProjectCatalogDetailRow row={row} />
              <ProjectCatalogDetailRow row={partner} />
            </div>
          );
        }
        return <ProjectCatalogDetailRow key={row.id} row={row} />;
      })}
    </dl>
  );
};

export const ProjectCatalogCheckList = ({ items }: { items: string[] }) => (
  <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2.5 text-sm text-ink-navy">
        <Check className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={2.5} aria-hidden />
        <span>{item}</span>
      </li>
    ))}
  </ul>
);
