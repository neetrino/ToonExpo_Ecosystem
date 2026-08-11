'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { startTransition, useEffect, useRef, useState } from 'react';

import { PROJECTS_SEARCH_DEBOUNCE_MS } from '@/features/catalog/constants/projects';
import {
  buildProjectSearchParams,
  type ProjectFilterParams,
} from '@/features/catalog/utils/project-filters';
import { useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { Input } from '@/shared/ui/input';

type ProjectLiveSearchProps = {
  filters: ProjectFilterParams;
};

const buildProjectsHref = (filters: ProjectFilterParams, q: string): string => {
  const nextFilters: ProjectFilterParams = {
    ...filters,
    page: 1,
  };
  if (q.length > 0) {
    nextFilters.q = q;
  } else {
    delete nextFilters.q;
  }
  const query = new URLSearchParams(buildProjectSearchParams(nextFilters)).toString();
  return query.length > 0 ? `/projects?${query}` : '/projects';
};

/**
 * Live keyword search for the public projects list — updates `?q=` as you type.
 */
export const ProjectLiveSearch = ({ filters }: ProjectLiveSearchProps) => {
  const t = useTranslations('Catalog');
  const router = useRouter();
  const filtersRef = useRef(filters);
  const isUserInputRef = useRef(false);
  const [search, setSearch] = useState(filters.q ?? '');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, PROJECTS_SEARCH_DEBOUNCE_MS);
  /* Clearing applies at once so the full list returns immediately. */
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const urlQ = filters.q ?? '';

  filtersRef.current = filters;

  useEffect(() => {
    if (isUserInputRef.current) {
      return;
    }
    setSearch(urlQ);
  }, [urlQ]);

  useEffect(() => {
    if (!isUserInputRef.current) {
      return;
    }
    if (activeSearch === urlQ) {
      isUserInputRef.current = false;
      return;
    }
    startTransition(() => {
      router.replace(buildProjectsHref(filtersRef.current, activeSearch), { scroll: false });
    });
  }, [activeSearch, urlQ, router]);

  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
      {t('filters.search')}
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          value={search}
          placeholder={t('filters.searchPlaceholder')}
          aria-label={t('filters.search')}
          className="pl-10"
          autoComplete="off"
          onChange={(event) => {
            isUserInputRef.current = true;
            setSearch(event.target.value);
          }}
        />
      </div>
    </label>
  );
};
