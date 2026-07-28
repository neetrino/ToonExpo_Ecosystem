import { Search } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import type { BuilderListFilters } from '@/features/catalog/utils/builder-filters';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';

type BuildersSearchFormProps = {
  filters: BuilderListFilters;
};

/**
 * GET search for the public builders list (shareable `?q=`).
 */
export const BuildersSearchForm = async ({ filters }: BuildersSearchFormProps) => {
  const t = await getTranslations('Catalog.buildersPage.search');
  const hasQuery = filters.q.length > 0;

  return (
    <form method="get" action="/builders" className="flex flex-wrap items-center gap-3">
      <div className="relative min-w-[min(100%,18rem)] flex-1">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-muted"
          aria-hidden
        />
        <Input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder={t('placeholder')}
          aria-label={t('label')}
          className="pl-10"
          autoComplete="off"
        />
      </div>
      <Button type="submit" variant="secondary" size="md" className="h-11">
        {t('apply')}
      </Button>
      {hasQuery ? (
        <Link href="/builders">
          <Button type="button" variant="outline" size="md" className="h-11">
            {t('reset')}
          </Button>
        </Link>
      ) : null}
    </form>
  );
};
