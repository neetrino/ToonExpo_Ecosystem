import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpFromLine,
  Banknote,
  Building2,
  CalendarRange,
  Car,
  Check,
  ClipboardList,
  Droplets,
  Factory,
  FileBadge,
  Flame,
  Fuel,
  Hash,
  Home,
  Landmark,
  Layers,
  MapPin,
  MoveVertical,
  Navigation,
  Paintbrush,
  ParkingCircle,
  Percent,
  Ruler,
  Shield,
  ShieldCheck,
  Store,
  Warehouse,
} from 'lucide-react';

import type {
  ProjectCatalogCriterionId,
  ProjectCatalogRow,
} from '@/features/catalog/utils/build-project-catalog-rows';

export const PROJECT_CATALOG_CRITERION_ICON: Record<ProjectCatalogCriterionId, LucideIcon> = {
  propertyType: Building2,
  country: MapPin,
  city: Home,
  address: Navigation,
  brandName: Landmark,
  permitNumber: FileBadge,
  constructionStart: CalendarRange,
  constructionEnd: CalendarRange,
  constructionStatus: ClipboardList,
  partnerBank: Banknote,
  pricePerSqm: Percent,
  areaRange: Ruler,
  unitPriceRange: Banknote,
  managementFee: Banknote,
  parkingAvailable: Car,
  storageAvailable: Warehouse,
  elevator: ArrowUpFromLine,
  constructionType: Factory,
  facadeMaterials: Paintbrush,
  seismicStandard: Shield,
  buildingsCount: Building2,
  apartmentsCount: Hash,
  parkingSpaces: ParkingCircle,
  ceilingHeight: MoveVertical,
  floorsCount: Layers,
  heating: Flame,
  hotWater: Droplets,
  gas: Fuel,
  schoolDistance: MapPin,
  kindergartenDistance: MapPin,
  commercialAreaSqm: Ruler,
  distanceExtra: MapPin,
  economicZone: Store,
  finishingStatus: Paintbrush,
  services: ClipboardList,
  paymentTypes: Banknote,
  installmentTerms: ClipboardList,
  mortgageTerms: Banknote,
  specialTerms: ShieldCheck,
  handoverDescription: ClipboardList,
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

export const ProjectCatalogDetailsList = ({ rows }: { rows: ProjectCatalogRow[] }) => (
  <dl className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
    {rows.map((row) => (
      <div
        key={row.id}
        className="flex items-baseline justify-between gap-4 border-b border-header-border py-3"
      >
        <dt className="shrink-0 text-sm text-ink-muted">{row.label}</dt>
        <dd className="min-w-0 text-right text-sm font-semibold whitespace-pre-line text-ink-navy">
          {row.value}
        </dd>
      </div>
    ))}
  </dl>
);

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
