import type { CatalogProjectRef } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import { buildApartmentPublicHref, buildProjectBuildingPublicHref, buildProjectPublicHref } from '@/features/geo-map/public/utils/build-project-public-href';

export type CatalogPathLevel = 'building' | 'floor' | 'apartment';

type PathRef = {
  id: string;
  name: string;
};

type ProjectPathRef = Pick<CatalogProjectRef, 'id' | 'name' | 'slug'>;

type FloorPathRef = {
  id: string;
  label: string;
};

type ApartmentPathRef = {
  id: string;
  slug: string;
  label: string;
};

type BreadcrumbItem = {
  id: string;
  label: string;
  href?: string;
};

type CatalogPathBreadcrumbProps = {
  ariaLabel: string;
  /** Geographic district when set on the project. */
  district: string | null;
  project: ProjectPathRef;
  building: PathRef;
  floor?: FloorPathRef;
  /** Current apartment, or a deeper shortcut from building/floor pages. */
  apartment?: ApartmentPathRef;
  /** Current page — that segment is not a link. */
  current: CatalogPathLevel;
  className?: string;
};

/**
 * Shared catalog hierarchy path (district → project → building → floor → apartment).
 * The `current` segment is plain text; ancestors and deeper shortcuts remain clickable.
 */
export const CatalogPathBreadcrumb = ({
  ariaLabel,
  district,
  project,
  building,
  floor,
  apartment,
  current,
  className,
}: CatalogPathBreadcrumbProps) => {
  const items = buildCatalogPathItems({
    district,
    project,
    building,
    current,
    ...(floor ? { floor } : {}),
    ...(apartment ? { apartment } : {}),
  });

  return (
    <nav className={cn('mb-6 w-full text-sm', className)} aria-label={ariaLabel}>
      <ol className="flex flex-wrap items-baseline gap-x-1.5 gap-y-1">
        {items.map((item, index) => {
          const isCurrent = item.id === current;
          return (
            <li key={item.id} className="inline-flex max-w-full items-baseline gap-x-1.5">
              {index > 0 ? (
                <span className="shrink-0 text-brand/70" aria-hidden>
                  /
                </span>
              ) : null}
              {item.href && !isCurrent ? (
                <Link
                  href={item.href}
                  className={cn(
                    'break-words italic text-brand transition-colors',
                    'hover:text-brand-hover hover:underline',
                  )}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={cn(
                    'break-words italic text-ink-navy',
                    isCurrent ? 'font-semibold' : 'font-normal text-brand',
                  )}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

const buildCatalogPathItems = ({
  district,
  project,
  building,
  floor,
  apartment,
  current,
}: {
  district: string | null;
  project: ProjectPathRef;
  building: PathRef;
  floor?: FloorPathRef;
  apartment?: ApartmentPathRef;
  current: CatalogPathLevel;
}): BreadcrumbItem[] => {
  const districtLabel = district?.trim() || null;
  const items: BreadcrumbItem[] = [];

  if (districtLabel) {
    items.push({
      id: 'district',
      label: districtLabel,
      href: `/projects?q=${encodeURIComponent(districtLabel)}`,
    });
  }

  items.push({
    id: 'project',
    label: project.name,
    href: buildProjectPublicHref(project.slug),
  });

  const buildingHref = buildProjectBuildingPublicHref(project.slug, building.id);
  items.push({
    id: 'building',
    label: building.name,
    ...(current === 'building' ? {} : { href: buildingHref }),
  });

  if (floor) {
    const floorHref = `${buildingHref}/floors/${floor.id}`;
    items.push({
      id: 'floor',
      label: floor.label,
      ...(current === 'floor' ? {} : { href: floorHref }),
    });
  }

  if (apartment) {
    items.push({
      id: 'apartment',
      label: apartment.label,
      ...(current === 'apartment' ? {} : { href: buildApartmentPublicHref(apartment.slug) }),
    });
  }

  return items;
};
