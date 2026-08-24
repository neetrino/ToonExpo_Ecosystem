'use client';

import { Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import { EXHIBITOR_SEARCH_DEBOUNCE_MS } from '@/features/catalog/constants';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { cn } from '@/shared/ui/cn';
import { Input } from '@/shared/ui/input';

type ExhibitorLiveSearchProps = {
  q: string | undefined;
  label: string;
  placeholder: string;
  onSearch: (q: string) => void;
};

/**
 * Live keyword search for the exhibitors catalog — updates `?q=` as you type.
 */
export const ExhibitorLiveSearch = ({
  q,
  label,
  placeholder,
  onSearch,
}: ExhibitorLiveSearchProps) => {
  const isUserInputRef = useRef(false);
  const onSearchRef = useRef(onSearch);
  const [search, setSearch] = useState(q ?? '');
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, EXHIBITOR_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;
  const urlQ = q ?? '';

  onSearchRef.current = onSearch;

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
    onSearchRef.current(activeSearch);
  }, [activeSearch, urlQ]);

  return (
    <label className="mb-4 flex max-w-md flex-col gap-1 text-xs font-medium text-ink-secondary">
      {label}
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          value={search}
          placeholder={placeholder}
          aria-label={label}
          className={cn('h-10 px-3.5 pl-10 text-base lg:text-sm')}
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
