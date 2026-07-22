'use client';

import type { ProjectListItem } from '@toonexpo/contracts';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { computeSoldPercent, resolveBadge } from '@/features/catalog/utils/development-progress';
import { formatCompactPrice } from '@/features/catalog/utils/format-price';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type HomeDevelopmentsMapProps = {
  projects: ProjectListItem[];
};

/**
 * Map-view panel: selected project card + developments list (Figma aside).
 */
export const HomeDevelopmentsMap = ({ projects }: HomeDevelopmentsMapProps) => {
  const t = useTranslations('HomePage.developments');
  const catalogT = useTranslations('Catalog');
  const locale = useLocale();
  const [selectedId, setSelectedId] = useState(projects[0]?.id ?? '');
  const selected = projects.find((project) => project.id === selectedId) ?? projects[0];

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

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,22rem)]">
      <div
        className={cn(
          'relative min-h-80 overflow-hidden rounded-[20px] bg-map-canvas',
          'ring-1 ring-header-border lg:min-h-[42rem]',
        )}
      >
        <div className="absolute inset-0 opacity-40">
          <div className="absolute inset-[12%] rounded-[20px] border border-dashed border-brand-secondary/40" />
          <div className="absolute top-1/3 left-1/4 size-3 rounded-pill bg-brand-deep shadow-md" />
          <div className="absolute top-1/2 left-1/2 size-3 rounded-pill bg-brand-secondary shadow-md" />
          <div className="absolute top-2/3 left-2/3 size-3 rounded-pill bg-brand-deep shadow-md" />
        </div>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-canvas/90 to-transparent p-6">
          <p className="text-sm font-medium text-ink-navy">{t('mapPlaceholder')}</p>
          <Link
            href="/projects"
            className="mt-2 inline-flex text-sm font-semibold text-brand-deep hover:text-brand-deep/80"
          >
            {t('browseList')}
          </Link>
        </div>
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
            {projects.map((project) => {
              const isActive = project.id === selected.id;
              return (
                <li key={project.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(project.id)}
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

const StatTile = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="rounded-sm bg-brand-soft/40 p-2">
      <p className="text-[9px] font-bold tracking-widest text-header-muted uppercase">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-ink-navy">{value}</p>
    </div>
  );
};
