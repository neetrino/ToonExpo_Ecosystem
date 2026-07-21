'use client';

import { Search } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState, type FormEvent } from 'react';

import { useRouter } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type HeroSearchProps = {
  className?: string | undefined;
};

/**
 * Hero search: navigates to projects with optional city filter.
 */
export const HeroSearch = ({ className }: HeroSearchProps) => {
  const t = useTranslations('HomePage');
  const router = useRouter();
  const [query, setQuery] = useState('');

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length > 0) {
      router.push(`/projects?city=${encodeURIComponent(trimmed)}`);
      return;
    }
    router.push('/projects');
  };

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'w-full max-w-[820px] rounded-md border border-border/60 bg-surface-elevated p-2.5 shadow-lg sm:p-3.5',
        className,
      )}
    >
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-stretch">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{t('hero.searchLabel')}</span>
          <Search
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-ink-muted"
            aria-hidden
          />
          <input
            type="search"
            name="city"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder={t('hero.searchPlaceholder')}
            className="h-11 w-full rounded-sm bg-surface-input py-2 pr-4 pl-10 text-base text-ink placeholder:text-ink-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30 sm:text-sm"
          />
        </label>
        <Button type="submit" variant="secondary" className="h-11 rounded-sm px-6">
          {t('hero.search')}
        </Button>
      </div>
    </form>
  );
};
