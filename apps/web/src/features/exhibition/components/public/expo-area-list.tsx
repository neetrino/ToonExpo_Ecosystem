'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { ChangeEventHandler } from 'react';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { cn } from '@/shared/ui/cn';
import { SearchField } from '@/shared/ui/search-field';

type ExpoAreaListProps = {
  areas: PublicVenueMapArea[];
  highlightedAreaId: string | null;
  search: string;
  onSearchChange: (value: string) => void;
  onSelect: (areaId: string) => void;
};

/**
 * Area list for the public venue map (sidebar on large screens).
 */
export const ExpoAreaList = ({
  areas,
  highlightedAreaId,
  search,
  onSearchChange,
  onSelect,
}: ExpoAreaListProps) => {
  const t = useTranslations('Expo.list');
  const tArea = useTranslations('Expo.area');
  const tSearch = useTranslations('Expo.search');

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onSearchChange(event.target.value);
  };

  return (
    <aside className="flex max-h-[min(70vh,40rem)] flex-col overflow-hidden rounded-[20px] border border-header-border bg-surface-elevated p-4">
      <h2 className="shrink-0 px-1 pb-3 text-base font-semibold text-ink-navy">{t('title')}</h2>
      <div className="shrink-0 pb-3">
        <SearchField
          value={search}
          placeholder={tSearch('placeholder')}
          onChange={onChange}
          aria-label={tSearch('label')}
        />
      </div>
      <ul className="flex flex-col gap-2 overflow-y-auto">
        {areas.map((area) => {
          const isHighlighted = highlightedAreaId === area.id;

          return (
            <li key={area.id}>
              <button
                type="button"
                className={cn(
                  'flex w-full flex-col gap-0.5 rounded-[12px] border px-3 py-2.5 text-left',
                  'transition-colors hover:border-brand/40',
                  isHighlighted
                    ? 'border-brand/40 bg-brand-soft/40'
                    : 'border-header-border bg-canvas',
                )}
                onClick={() => onSelect(area.id)}
              >
                <span className="truncate text-sm font-semibold text-ink-navy">
                  {resolveVenueMapAreaTitle(area)}
                </span>
                <span className="text-xs text-header-muted">
                  {area.code} — {tArea('areaSqm', { value: area.areaSqm })}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
};
