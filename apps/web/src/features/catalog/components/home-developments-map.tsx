'use client';

import type {
  ProjectListItem,
  PublicCityMapConfig,
  PublicCityMapPlacement,
} from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';

import { listProjects } from '@/features/catalog/api/catalog-api';
import { computeSoldPercent, resolveBadge } from '@/features/catalog/utils/development-progress';
import { formatCompactPrice } from '@/features/catalog/utils/format-price';
import {
  getPublicCityMapConfig,
  listPublicCityMapPlacements,
} from '@/features/city-map/api/city-map-api';
import { CityMapView } from '@/features/city-map/components/city-map-view';
import {
  mergeHomeMapPoses,
  projectPinId,
  CITY_MAP_PROJECTS_PAGE_SIZE,
} from '@/features/city-map/constants';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type HomeDevelopmentsMapProps = {
  projects: ProjectListItem[];
};

const projectHasCoords = (project: ProjectListItem): boolean =>
  Boolean(project.latitude && project.longitude);

/**
 * Map-view panel: live city map + selected project card + developments list.
 */
export const HomeDevelopmentsMap = ({ projects }: HomeDevelopmentsMapProps) => {
  const t = useTranslations('HomePage.developments');
  const catalogT = useTranslations('Catalog');
  const locale = useLocale();
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '');
  const [pinProjects, setPinProjects] = useState(projects);
  const [placements, setPlacements] = useState<PublicCityMapPlacement[]>([]);
  const [config, setConfig] = useState<PublicCityMapConfig | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [flyToId, setFlyToId] = useState<string | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);

  const selected =
    pinProjects.find((project) => project.id === selectedId) ??
    projects.find((project) => project.id === selectedId) ??
    pinProjects[0] ??
    projects[0];

  useEffect(() => {
    setPinProjects(projects);
  }, [projects]);

  /**
   * Fresh browser fetch (no-store): Next Data Cache can serve SSR projects
   * without lat/lng; this pass always has coordinates when the API is up.
   */
  useEffect(() => {
    let cancelled = false;
    void listProjects(
      { page: 1, pageSize: CITY_MAP_PROJECTS_PAGE_SIZE },
      { locale, cacheMode: 'no-store' },
    )
      .then((response) => {
        if (cancelled || response.data.length === 0) {
          return;
        }
        const withCoords = response.data.filter(projectHasCoords);
        if (withCoords.length > 0) {
          setPinProjects(withCoords);
          return;
        }
        const byId = new Map(response.data.map((item) => [item.id, item]));
        setPinProjects(projects.map((project) => byId.get(project.id) ?? project));
      })
      .catch(() => {
        /* keep SSR props */
      });
    return () => {
      cancelled = true;
    };
  }, [locale, projects]);

  useEffect(() => {
    let cancelled = false;
    void listPublicCityMapPlacements()
      .then((response) => {
        if (!cancelled) {
          setPlacements(response.data);
        }
      })
      .catch(() => {
        /* Project pins still render without placements. */
      });
    void getPublicCityMapConfig()
      .then((mapConfig) => {
        if (!cancelled) {
          setConfig(mapConfig);
        }
      })
      .catch(() => {
        /* CityMapView falls back to CITY_MAP_DEFAULT_CONFIG. */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const models = useMemo(
    () => mergeHomeMapPoses(pinProjects, placements),
    [pinProjects, placements],
  );

  const searchHits = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return [];
    }
    return models.filter((item) => {
      const haystack = [item.label, item.projectId].join(' ').toLowerCase();
      return haystack.includes(q);
    });
  }, [models, search]);

  if (!selected) {
    return null;
  }

  const soldPercent = computeSoldPercent(selected);
  const badge = resolveBadge(soldPercent);
  const location =
    [selected.city, selected.district].filter(Boolean).join(', ') || selected.city || '—';
  const priceLabel = formatCompactPrice({
    amount: selected.minPrice,
    currency: selected.priceCurrency,
    locale,
    fromLabel: catalogT('price.from'),
    onRequestLabel: catalogT('price.onRequest'),
  });

  const resolveFlyTarget = (projectId: string): string => {
    const placement = placements.find((item) => item.projectId === projectId);
    return placement?.id ?? projectPinId(projectId);
  };

  const selectProject = (projectId: string, placementId?: string): void => {
    setSelectedId(projectId);
    const targetId = placementId ?? resolveFlyTarget(projectId);
    setSelectedPlacementId(targetId);
    setFlyToId(targetId);
  };

  const clearMapPinSelection = (): void => {
    setSelectedPlacementId(null);
    setFlyToId(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
      <div
        className={cn(
          'relative min-h-80 overflow-hidden rounded-[20px] bg-map-canvas',
          'ring-1 ring-header-border lg:min-h-[42rem]',
        )}
      >
        {mapError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center">
            <p className="text-sm font-medium text-ink-navy">{mapError}</p>
            <Link
              href="/developments"
              className="text-sm font-semibold text-brand-deep hover:text-brand-deep/80"
            >
              {t('browseList')}
            </Link>
          </div>
        ) : (
          <>
            <div className="absolute top-3 left-3 z-10 w-[min(100%-1.5rem,18rem)]">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('mapSearchPlaceholder')}
                className="w-full rounded-md border border-header-border bg-canvas/95 px-3 py-2 text-sm shadow-sm"
              />
              {searchHits.length > 0 ? (
                <ul className="mt-1 max-h-40 overflow-auto rounded-md border border-header-border bg-canvas shadow-md">
                  {searchHits.slice(0, 8).map((item) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        className="flex w-full px-3 py-2 text-left text-sm hover:bg-band-mist/40"
                        onClick={() => {
                          setSearch('');
                          selectProject(item.projectId);
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
            <CityMapView
              mode="view"
              className="min-h-80 lg:min-h-[42rem]"
              config={config}
              models={models}
              selectedPlacementId={selectedPlacementId}
              flyToPlacementId={flyToId}
              onSelectPlacement={(placementId, projectId) => {
                selectProject(projectId, placementId);
              }}
              onDeselectPlacement={clearMapPinSelection}
              onError={() => setMapError(t('mapLoadError'))}
            />
          </>
        )}
      </div>

      <aside className="flex flex-col gap-4">
        <article className="overflow-hidden rounded-[20px] bg-surface-elevated ring-1 ring-header-border">
          <div className="relative aspect-[16/10] overflow-hidden bg-surface">
            {selected.cover ? (
              <Image
                src={selected.cover.fileUrl}
                alt={selected.cover.altText ?? selected.name}
                fill
                className="object-cover"
                sizes="340px"
              />
            ) : null}
            <span
              className={cn(
                'absolute top-3 left-3 rounded-sm bg-canvas/95 px-2 py-1',
                'text-[10px] font-bold tracking-widest text-brand-deep uppercase',
              )}
            >
              {t(`badges.${badge}`)}
            </span>
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-brand text-lg font-semibold tracking-[-0.02em] text-ink-navy">
                {selected.name}
              </h3>
              <p className="shrink-0 text-sm font-semibold text-brand-deep">{priceLabel}</p>
            </div>
            <p className="mt-1 text-xs text-header-muted">
              {selected.builder.name}
              {' · '}
              {location}
            </p>
            {selected.shortDescription ? (
              <p className="mt-3 line-clamp-2 text-sm leading-5 text-ink-navy/80">
                {selected.shortDescription}
              </p>
            ) : null}

            <div className="mt-4 grid grid-cols-3 gap-3 text-center">
              <StatTile label={t('units')} value={String(selected.availability.total)} />
              <StatTile label={t('sold')} value={String(selected.availability.sold)} />
              <StatTile label={t('done')} value={t('completionTbaShort')} />
            </div>

            <Link
              href={`/projects/${selected.id}`}
              className={cn(
                'mt-5 flex h-10 items-center justify-center rounded-md bg-brand-deep px-4',
                'text-sm font-semibold text-on-dark transition-colors hover:bg-brand-deep/90',
              )}
            >
              {catalogT('actions.viewProject')}
            </Link>
          </div>
        </article>

        <div className="rounded-[20px] bg-surface-elevated p-4 ring-1 ring-header-border">
          <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
            {t('allDevelopments')}
          </p>
          <ul className="mt-2 divide-y divide-header-border">
            {pinProjects.map((project) => {
              const isActive = project.id === selected?.id;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => selectProject(project.id)}
                    className={cn(
                      'flex w-full items-center justify-between gap-3 py-2.5 text-left text-sm',
                      'transition-colors duration-[var(--duration-fast)]',
                      isActive
                        ? 'font-medium text-brand-deep'
                        : 'text-ink-navy hover:text-brand-deep',
                    )}
                  >
                    <span className="truncate">{project.name}</span>
                    <span className="shrink-0 text-xs font-normal text-header-muted">
                      {project.city ?? '—'}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>
    </div>
  );
};

type StatTileProps = {
  label: string;
  value: string;
};

const StatTile = ({ label, value }: StatTileProps) => (
  <div className="rounded-md bg-band-mist/40 px-2 py-2">
    <p className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
    <p className="mt-1 text-sm font-semibold text-ink-navy">{value}</p>
  </div>
);
