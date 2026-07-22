import type { BuildingSummary, ProjectDetail } from '@toonexpo/contracts';
import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

/** Figma `89:1281` axonometric building visual for the floor picker panel. */
const FLOOR_PICKER_VISUAL_SRC = '/images/project-floor-axonometric.png';

type ProjectFloorPickerProps = {
  project: ProjectDetail;
};

/**
 * “Choose a floor” band with building stack + axonometric visual — Figma `89:876` / `89:1281`.
 */
export const ProjectFloorPicker = async ({ project }: ProjectFloorPickerProps) => {
  const t = await getTranslations('Catalog.projectDetail');
  const building = pickPrimaryBuilding(project.buildings);
  const floors = building ? [...building.floors].sort((a, b) => b.number - a.number) : [];

  return (
    <section className="border-t border-header-border bg-band-mist/20">
      <div className="page-container py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-brand text-2xl font-bold tracking-[-0.02em] text-ink-navy">
              {t('floorsTitle')}
            </h2>
            <p className="mt-1 text-sm text-header-muted">{t('floorsSubtitle')}</p>
          </div>
          <ul className="flex flex-wrap gap-4 text-xs text-ink-navy">
            <Legend swatch="bg-brand-secondary" label={t('legendAvailable')} />
            <Legend swatch="bg-[#ffba00]" label={t('legendReserved')} />
            <Legend swatch="bg-header-border" label={t('legendSold')} />
          </ul>
        </div>

        {!building || floors.length === 0 ? (
          <p className="text-sm text-header-muted">{t('floorsEmpty')}</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
            <div className="rounded-[20px] bg-surface-elevated p-3 ring-1 ring-header-border">
              <p className="px-3 pt-1 text-[10px] font-bold tracking-widest text-header-muted uppercase">
                {t('buildingStack')}
                {project.buildings.length > 1 ? ` · ${building.name}` : null}
              </p>
              <ul className="mt-2 max-h-[32.5rem] space-y-1 overflow-y-auto pr-1">
                {floors.map((floor) => (
                  <li key={floor.id}>
                    <Link
                      href={`/projects/${project.id}/buildings/${building.id}/floors/${floor.id}`}
                      className={cn(
                        'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5',
                        'transition-colors hover:bg-band-mist/60',
                      )}
                    >
                      <span className="font-brand text-sm font-bold text-ink-navy">
                        {floor.displayLabel ?? t('floorLabel', { number: floor.number })}
                      </span>
                      <span className="flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            'rounded-pill px-2 py-0.5 font-semibold',
                            floor.availability.available > 0
                              ? 'bg-brand-secondary/15 text-brand-secondary'
                              : 'bg-header-border/60 text-header-muted',
                          )}
                        >
                          {t('availCount', { count: floor.availability.available })}
                        </span>
                        <span className="text-header-muted">
                          {t('unitsCount', { count: floor.availability.total })}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative min-h-[20rem] overflow-hidden rounded-[20px] bg-surface ring-1 ring-header-border lg:min-h-[32.5rem]">
              <Image
                src={FLOOR_PICKER_VISUAL_SRC}
                alt={t('floorVisualAlt', { project: project.name })}
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 66vw"
                priority={false}
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

const Legend = ({ swatch, label }: { swatch: string; label: string }) => (
  <li className="flex items-center gap-2">
    <span className={cn('size-3 rounded-sm', swatch)} aria-hidden />
    <span>{label}</span>
  </li>
);

const pickPrimaryBuilding = (buildings: BuildingSummary[]): BuildingSummary | null => {
  const withFloors = buildings.find((building) => building.floors.length > 0);
  return withFloors ?? buildings[0] ?? null;
};
