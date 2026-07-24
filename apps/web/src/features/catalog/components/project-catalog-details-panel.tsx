import type { LucideIcon } from 'lucide-react';
import {
  ArrowUpFromLine,
  Banknote,
  Building2,
  CalendarRange,
  Car,
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

import { ProjectCatalogCollapsible } from '@/features/catalog/components/project-catalog-collapsible';
import { ProjectCatalogLinksSection } from '@/features/catalog/components/project-catalog-links-section';
import type {
  ProjectCatalogCriterionId,
  ProjectCatalogRow,
} from '@/features/catalog/utils/build-project-catalog-rows';
import type { ProjectCatalogLink } from '@/features/catalog/utils/project-catalog-details';
import { cn } from '@/shared/ui/cn';

type ProjectCatalogDetailsPanelProps = {
  title: string;
  aboutTitle: string;
  aboutText: string | null;
  factsTitle: string;
  amenitiesTitle: string;
  nearbyTitle: string;
  linksTitle: string;
  linkLabels: Record<ProjectCatalogLink['id'], string>;
  rows: ProjectCatalogRow[];
  amenityLabels: string[];
  nearbyPlaces: string[];
  links: ProjectCatalogLink[];
};

const CRITERION_ICON: Record<ProjectCatalogCriterionId, LucideIcon> = {
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

/**
 * Project catalog block: about, fact cards, amenities, nearby places, links.
 * Dense blocks collapse behind a chevron so the page stays scannable.
 */
export const ProjectCatalogDetailsPanel = ({
  title,
  aboutTitle,
  aboutText,
  factsTitle,
  amenitiesTitle,
  nearbyTitle,
  linksTitle,
  linkLabels,
  rows,
  amenityLabels,
  nearbyPlaces,
  links,
}: ProjectCatalogDetailsPanelProps) => {
  const cardRows = rows.filter((row) => !row.wide);
  const listRows = rows.filter((row) => row.wide);
  const hasAbout = aboutText != null && aboutText.trim().length > 0;
  const hasFacts = rows.length > 0;
  const hasAmenities = amenityLabels.length > 0;
  const hasNearby = nearbyPlaces.length > 0;
  const hasLinks = links.length > 0;

  if (!hasAbout && !hasFacts && !hasAmenities && !hasNearby && !hasLinks) {
    return null;
  }

  return (
    <section className="page-container py-12 sm:py-16">
      <h2 className="font-brand text-3xl font-bold tracking-tight text-ink-navy sm:text-4xl">
        {title}
      </h2>

      <div className="mt-8 space-y-6">
        {hasAbout ? (
          <ProjectCatalogCollapsible title={aboutTitle} defaultOpen>
            <p className="max-w-3xl whitespace-pre-line text-base leading-7 text-ink-navy">
              {aboutText}
            </p>
          </ProjectCatalogCollapsible>
        ) : null}

        {hasFacts ? (
          <ProjectCatalogCollapsible title={factsTitle}>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cardRows.map((row) => (
                <FactCard key={row.id} row={row} />
              ))}
            </dl>
            {listRows.length > 0 ? (
              <dl className="mt-6 border-t border-header-border">
                {listRows.map((row) => (
                  <FactListRow key={row.id} row={row} />
                ))}
              </dl>
            ) : null}
          </ProjectCatalogCollapsible>
        ) : null}

        {hasAmenities ? (
          <ProjectCatalogCollapsible title={amenitiesTitle}>
            <TagList items={amenityLabels} />
          </ProjectCatalogCollapsible>
        ) : null}

        {hasNearby ? (
          <ProjectCatalogCollapsible title={nearbyTitle}>
            <TagList items={nearbyPlaces} />
          </ProjectCatalogCollapsible>
        ) : null}

        {hasLinks ? (
          <ProjectCatalogCollapsible title={linksTitle}>
            <ProjectCatalogLinksSection links={links} labels={linkLabels} />
          </ProjectCatalogCollapsible>
        ) : null}
      </div>
    </section>
  );
};

const FactCard = ({ row }: { row: ProjectCatalogRow }) => {
  const Icon = CRITERION_ICON[row.id];

  return (
    <div
      className={cn(
        'flex min-h-[4.5rem] items-center gap-3 rounded-[15px] border border-header-border',
        'bg-canvas px-4 py-3.5 transition-[transform,box-shadow] duration-200',
        'hover:-translate-y-0.5 hover:shadow-sm',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          'bg-band-mist text-brand-deep',
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
          {row.label}
        </dt>
        <dd className="mt-1 truncate text-sm font-bold text-ink-navy">{row.value}</dd>
      </div>
    </div>
  );
};

const FactListRow = ({ row }: { row: ProjectCatalogRow }) => {
  const Icon = CRITERION_ICON[row.id];

  return (
    <div className="flex items-center gap-3 border-b border-header-border py-4 last:border-b-0">
      <Icon className="size-4 shrink-0 text-brand-deep" strokeWidth={2} aria-hidden />
      <dt className="w-36 shrink-0 text-[10px] font-bold tracking-widest text-header-muted uppercase sm:w-44">
        {row.label}
      </dt>
      <dd className="min-w-0 flex-1 text-sm font-semibold whitespace-pre-line text-ink-navy">
        {row.value}
      </dd>
    </div>
  );
};

const TagList = ({ items }: { items: string[] }) => (
  <ul className="flex flex-wrap gap-2">
    {items.map((item) => (
      <li
        key={item}
        className="rounded-full border border-header-border bg-canvas px-3.5 py-1.5 text-sm font-medium text-ink-navy"
      >
        {item}
      </li>
    ))}
  </ul>
);
