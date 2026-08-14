'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { SearchX, SquarePen, Tags } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { ReadinessCategoryCard } from '@/features/admin/components/readiness-category-card';
import { ServiceProviderCategoryForm } from '@/features/admin/components/service-provider-category-form';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminServiceProviderCategoriesQuery } from '@/features/admin/hooks/use-admin-service-providers';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { BackLink } from '@/shared/ui/back-link';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { IconButton } from '@/shared/ui/icon-button';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { VIEW_MODE_CARDS } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const matchesCategorySearch = (
  category: ServiceProviderCategoryItem,
  needle: string,
): boolean => {
  const haystack = [category.name, category.description ?? ''].join(' ').toLowerCase();
  return haystack.includes(needle);
};

/**
 * Admin catalog of service provider categories used when adding a provider.
 */
export const ReadinessCategoriesPage = () => {
  const t = useTranslations('Admin.readiness.categories');
  const tCommon = useTranslations('Common.integratedSearch');
  const query = useAdminServiceProviderCategoriesQuery();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ServiceProviderCategoryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.readinessCategories,
  );

  const trimmedSearch = search.trim().toLowerCase();
  const categories = useMemo(() => {
    const rows = query.data?.data ?? [];
    if (trimmedSearch.length === 0) {
      return rows;
    }
    return rows.filter((category) => matchesCategorySearch(category, trimmedSearch));
  }, [query.data?.data, trimmedSearch]);

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError || !query.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-6">
        <BackLink href="/admin/readiness" label={t('backToAssessments')} className="-mt-2" />
        <ListPageHeader
          icon={Tags}
          title={t('title')}
          search={search}
          searchPlaceholder={t('searchPlaceholder')}
          searchAriaLabel={tCommon('searchLabel')}
          searchClassName="md:max-w-xs md:flex-none"
          onSearchChange={setSearch}
          onClearAll={() => {
            setSearch('');
          }}
          actions={
            <>
              <ViewModeToggle value={viewMode} onChange={setViewMode} />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => {
                  setCreating(true);
                  setEditing(null);
                }}
              >
                <AddActionLabel>{t('newCategory')}</AddActionLabel>
              </Button>
            </>
          }
        />
      </div>

      <AdminCreateSheet
        open={creating}
        onClose={() => {
          setCreating(false);
        }}
        title={t('createTitle')}
      >
        <ServiceProviderCategoryForm
          onDone={() => {
            setCreating(false);
          }}
        />
      </AdminCreateSheet>

      <AdminCreateSheet
        open={editing != null}
        onClose={() => {
          setEditing(null);
        }}
        title={editing ? t('editTitle', { name: editing.name }) : ''}
      >
        {editing ? (
          <ServiceProviderCategoryForm
            category={editing}
            onDone={() => {
              setEditing(null);
            }}
          />
        ) : null}
      </AdminCreateSheet>

      {categories.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center">
          <EmptyState
            icon={trimmedSearch.length > 0 ? SearchX : Tags}
            title={trimmedSearch.length > 0 ? t('noResultsTitle') : t('empty')}
            description={
              trimmedSearch.length > 0 ? t('noResults', { query: search.trim() }) : undefined
            }
            actionLabel={trimmedSearch.length > 0 ? t('clearSearch') : undefined}
            onAction={trimmedSearch.length > 0 ? () => setSearch('') : undefined}
            className="w-full max-w-md border-solid border-border/70 bg-surface-elevated px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          />
        </div>
      ) : effectiveViewMode === VIEW_MODE_CARDS ? (
        <AdminListCardGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => (
            <ReadinessCategoryCard
              key={category.id}
              category={category}
              onEdit={() => {
                setEditing(category);
                setCreating(false);
              }}
            />
          ))}
        </AdminListCardGrid>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-1 font-medium">{t('columns.name')}</th>
                <th className="px-3 py-1 text-center font-medium">{t('columns.active')}</th>
                <th className="px-3 py-1 text-center font-medium">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border hover:bg-surface/60">
                  <td className="px-3 py-1 font-medium text-ink">{category.name}</td>
                  <td className="px-3 py-1 text-center text-ink-secondary">
                    {category.active ? t('activeYes') : t('activeNo')}
                  </td>
                  <td className="px-3 py-1">
                    <div className="flex justify-center">
                      <IconButton
                        label={t('edit')}
                        size="sm"
                        className="text-cta-dark hover:bg-cta-dark/5"
                        onClick={() => {
                          setEditing(category);
                          setCreating(false);
                        }}
                      >
                        <SquarePen className="size-3.5" strokeWidth={1.75} aria-hidden />
                      </IconButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
