'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { AdminCreateProjectSheet } from '@/features/admin/components/admin-create-project-sheet';
import { CreateProjectSheet } from '@/features/builder/components/create-project-sheet';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { Button } from '@/shared/ui/button';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { LIST_CONTENT_BASE_DELAY_MS, Reveal } from '@/shared/ui/motion';

import {
  INTERACTIVE_MAPPING_DEFAULT_PAGE_SIZE,
  INTERACTIVE_MAPPING_SEARCH_DEBOUNCE_MS,
  interactiveMappingProjectsQueryKey,
} from '../constants';
import { useInteractiveMappingProjectsQuery } from '../hooks/use-interactive-mapping';
import { useInteractiveMappingScope } from '../scope/interactive-mapping-scope';
import { InteractiveMappingProjectCard } from './interactive-mapping-project-card';

const FIRST_PAGE = 1;

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

const buildListHref = (pathname: string, page: number): string => {
  if (page <= FIRST_PAGE) {
    return pathname;
  }
  return `${pathname}?page=${page}`;
};

/**
 * Interactive-mapping project list with search, pagination, and phase progress.
 */
export const InteractiveMappingProjectsPage = () => {
  const t = useTranslations('Admin.interactiveMapping');
  const tCommon = useTranslations('Common.integratedSearch');
  const { basePath, mode, showLabLink } = useInteractiveMappingScope();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const page = parsePage(searchParams.get('page'));
  const pageSize = INTERACTIVE_MAPPING_DEFAULT_PAGE_SIZE;
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const trimmedSearch = search.trim();
  const debouncedSearch = useDebouncedValue(trimmedSearch, INTERACTIVE_MAPPING_SEARCH_DEBOUNCE_MS);
  const activeSearch = trimmedSearch.length === 0 ? '' : debouncedSearch;

  const projectsQuery = useInteractiveMappingProjectsQuery({
    page,
    pageSize,
    ...(activeSearch ? { search: activeSearch } : {}),
  });

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(buildListHref(pathname, FIRST_PAGE));
    }
  };

  const handleProjectCreated = (projectId: string) => {
    void queryClient.invalidateQueries({
      queryKey: interactiveMappingProjectsQueryKey(mode),
    });
    router.push(`${basePath}/${projectId}`);
  };

  if (projectsQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (projectsQuery.isError || !projectsQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = projectsQuery.data;
  const projects = response.data;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={t('filters.searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        onSearchChange={handleSearchChange}
        onClearAll={() => {
          handleSearchChange('');
        }}
        actions={
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="shrink-0"
            onClick={() => {
              setCreateOpen(true);
            }}
          >
            <AddActionLabel>{t('createProject')}</AddActionLabel>
          </Button>
        }
      />

      {projects.length === 0 ? (
        <Reveal force delayMs={LIST_CONTENT_BASE_DELAY_MS}>
          <p className="text-sm text-ink-secondary">
            {activeSearch ? t('noResults', { query: activeSearch }) : t('empty')}
          </p>
        </Reveal>
      ) : (
        <AdminListCardGrid className="gap-4">
          {projects.map((project) => (
            <InteractiveMappingProjectCard
              key={project.id}
              project={project}
              href={`${basePath}/${project.id}`}
            />
          ))}
        </AdminListCardGrid>
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) => buildListHref(pathname, nextPage)}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      {showLabLink ? (
        <Reveal force delayMs={LIST_CONTENT_BASE_DELAY_MS}>
          <p className="text-xs text-ink-muted">
            <Link href={`${basePath}/lab`} className="underline-offset-4 hover:underline">
              {t('labLink')}
            </Link>
          </p>
        </Reveal>
      ) : null}

      {mode === 'admin' ? (
        <AdminCreateProjectSheet
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
          }}
          onCreated={handleProjectCreated}
        />
      ) : (
        <CreateProjectSheet
          open={createOpen}
          onClose={() => {
            setCreateOpen(false);
          }}
          onCreated={handleProjectCreated}
        />
      )}
    </div>
  );
};
