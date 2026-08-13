'use client';

import type { PublicVenueMapArea } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import type { ChangeEventHandler } from 'react';

import { resolveVenueMapAreaTitle } from '@/features/exhibition/utils/resolve-venue-map-area-title';
import { cn } from '@/shared/ui/cn';
import { SearchField } from '@/shared/ui/search-field';

type ExpoMapSearchProps = {
  search: string;
  results: PublicVenueMapArea[];
  onSearchChange: (value: string) => void;
  onSelect: (areaId: string) => void;
};

/**
 * Venue map search aligned with the page title.
 */
export const ExpoMapSearch = ({
  search,
  results,
  onSearchChange,
  onSelect,
}: ExpoMapSearchProps) => {
  const t = useTranslations('Expo.search');
  const showResults = search.trim().length > 0;

  const onChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    onSearchChange(event.target.value);
  };

  return (
    <div className="relative w-full shrink-0 sm:w-80">
      <SearchField
        value={search}
        placeholder={t('placeholder')}
        onChange={onChange}
        aria-label={t('label')}
      />
      {showResults ? <ExpoMapSearchResults results={results} onSelect={onSelect} /> : null}
    </div>
  );
};

type ExpoMapSearchResultsProps = {
  results: PublicVenueMapArea[];
  onSelect: (areaId: string) => void;
};

const ExpoMapSearchResults = ({ results, onSelect }: ExpoMapSearchResultsProps) => {
  const t = useTranslations('Expo.search');

  return (
    <ul
      className={cn(
        'absolute inset-x-0 top-full z-20 mt-2 max-h-56 overflow-y-auto rounded-[16px]',
        'bg-surface-elevated p-1 shadow-lg ring-1 ring-header-border',
      )}
    >
      {results.length === 0 ? (
        <li className="px-3 py-2.5 text-sm text-header-muted">{t('empty')}</li>
      ) : (
        results.map((area) => (
          <li key={area.id}>
            <button
              type="button"
              className={cn(
                'flex w-full rounded-[12px] px-3 py-2 text-left text-sm font-medium text-ink-navy',
                'hover:bg-brand-soft/40',
              )}
              onClick={() => onSelect(area.id)}
            >
              {resolveVenueMapAreaTitle(area)}
            </button>
          </li>
        ))
      )}
    </ul>
  );
};
