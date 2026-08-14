'use client';

import type { AdminServiceProviderItem, ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { LayoutList, SearchX, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { ServiceProviderCard } from '@/features/admin/components/service-provider-card';
import { ServiceProviderForm } from '@/features/admin/components/service-provider-form';
import { ServiceProvidersTable } from '@/features/admin/components/service-providers-table';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import type { ServiceProviderFormValues } from '@/features/admin/schemas/service-provider.schema';
import { toServiceProviderFormValues } from '@/features/admin/utils/service-provider-mappers';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { Button } from '@/shared/ui/button';
import { EmptyState } from '@/shared/ui/empty-state';
import { IconButton } from '@/shared/ui/icon-button';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { VIEW_MODE_CARDS } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const SERVICE_PROVIDER_FILTER_CATEGORY_KEY = 'categoryId';
const SERVICE_PROVIDER_FILTER_ACTIVE_KEY = 'active';

export type ServiceProviderFilters = {
  search: string;
  active: '' | 'true' | 'false';
  categoryId: string;
};

export type ServiceProvidersProvidersSectionProps = {
  categories: ServiceProviderCategoryItem[];
  providers: AdminServiceProviderItem[];
  filters: ServiceProviderFilters;
  onFiltersChange: (filters: ServiceProviderFilters) => void;
  creating: boolean;
  editing: AdminServiceProviderItem | null;
  onCreate: () => void;
  onEdit: (provider: AdminServiceProviderItem) => void;
  onDelete: (id: string) => void;
  onDone: () => void;
  onCreateSubmit: (values: ServiceProviderFormValues) => Promise<void>;
  onUpdateSubmit: (id: string, values: ServiceProviderFormValues) => Promise<void>;
  busy: boolean;
};

const categoryLogoForProvider = (
  provider: AdminServiceProviderItem,
  categories: readonly ServiceProviderCategoryItem[],
): string | null => {
  const firstCategoryId = provider.categories[0]?.id;
  if (!firstCategoryId) {
    return null;
  }
  return categories.find((category) => category.id === firstCategoryId)?.logoUrl ?? null;
};

const EMPTY_PROVIDER_DEFAULTS: ServiceProviderFormValues = {
  name: '',
  providerType: 'company',
  description: '',
  services: '',
  phone: '',
  email: '',
  website: '',
  socialFacebook: '',
  socialInstagram: '',
  socialLinkedin: '',
  internalNotes: '',
  active: true,
  categoryIds: [],
};

export const ServiceProvidersProvidersSection = ({
  categories,
  providers,
  filters,
  onFiltersChange,
  creating,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDone,
  onCreateSubmit,
  onUpdateSubmit,
  busy,
}: ServiceProvidersProvidersSectionProps) => {
  const t = useTranslations('Admin.serviceProviders');
  const tList = useTranslations('Admin.serviceProviders.providers');
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.serviceProviders,
  );

  const hasActiveFilters =
    filters.search.trim().length > 0 || filters.categoryId.length > 0 || filters.active.length > 0;

  const filterConfigs = useMemo(
    (): IntegratedSearchFilterConfig[] => [
      {
        key: SERVICE_PROVIDER_FILTER_CATEGORY_KEY,
        label: tList('columns.categories'),
        allOptionLabel: tList('filters.allCategories'),
        options: categories.map((category) => ({ value: category.id, label: category.name })),
      },
      {
        key: SERVICE_PROVIDER_FILTER_ACTIVE_KEY,
        label: tList('columns.active'),
        allOptionLabel: tList('filters.allActive'),
        options: [
          { value: 'true', label: tList('filters.active') },
          { value: 'false', label: tList('filters.inactive') },
        ],
      },
    ],
    [categories, tList],
  );

  return (
    <section className="flex flex-col gap-6">
      <ListPageHeader
        icon={LayoutList}
        title={t('title')}
        subtitle={t('subtitle')}
        search={filters.search}
        searchPlaceholder={tList('filters.searchPlaceholder')}
        searchAriaLabel={tList('filters.searchPlaceholder')}
        filters={filterConfigs}
        filterValues={{
          [SERVICE_PROVIDER_FILTER_CATEGORY_KEY]: filters.categoryId,
          [SERVICE_PROVIDER_FILTER_ACTIVE_KEY]: filters.active,
        }}
        onSearchChange={(value) => {
          onFiltersChange({ ...filters, search: value });
        }}
        onFilterChange={(key, value) => {
          if (key === SERVICE_PROVIDER_FILTER_CATEGORY_KEY) {
            onFiltersChange({ ...filters, categoryId: value });
            return;
          }
          if (key === SERVICE_PROVIDER_FILTER_ACTIVE_KEY) {
            onFiltersChange({ ...filters, active: value as '' | 'true' | 'false' });
          }
        }}
        onClearAll={() => {
          onFiltersChange({ ...filters, search: '', categoryId: '', active: '' });
        }}
        actions={
          <>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <Button type="button" size="sm" variant="secondary" onClick={onCreate}>
              <AddActionLabel>{tList('newProvider')}</AddActionLabel>
            </Button>
          </>
        }
      />

      <AdminCreateSheet
        open={creating}
        onClose={onDone}
        title={tList('newProvider')}
        size="comfortable"
      >
        <ServiceProviderForm
          key="create"
          categories={categories}
          defaultValues={EMPTY_PROVIDER_DEFAULTS}
          submitLabel={tList('create')}
          isBusy={busy}
          onCancel={onDone}
          onSubmit={async (values) => {
            await onCreateSubmit(values);
            onDone();
          }}
        />
      </AdminCreateSheet>

      <AdminCreateSheet
        open={editing != null}
        onClose={onDone}
        title={editing?.name ?? ''}
        size="comfortable"
        headerActions={
          editing ? (
            <IconButton
              label={tList('delete')}
              size="sm"
              className="text-danger hover:bg-danger-soft"
              disabled={busy}
              onClick={() => {
                onDelete(editing.id);
              }}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </IconButton>
          ) : undefined
        }
      >
        {editing ? (
          <ServiceProviderForm
            key={editing.id}
            categories={categories}
            defaultValues={toServiceProviderFormValues(editing)}
            submitLabel={tList('save')}
            isBusy={busy}
            onCancel={onDone}
            onSubmit={async (values) => {
              await onUpdateSubmit(editing.id, values);
              onDone();
            }}
          />
        ) : null}
      </AdminCreateSheet>

      {providers.length === 0 ? (
        <div className="flex min-h-72 items-center justify-center">
          <EmptyState
            icon={hasActiveFilters ? SearchX : LayoutList}
            title={hasActiveFilters ? tList('noResultsTitle') : tList('emptyTitle')}
            description={hasActiveFilters ? tList('noResults') : tList('empty')}
            actionLabel={hasActiveFilters ? tList('clearSearch') : tList('newProvider')}
            onAction={
              hasActiveFilters
                ? () => {
                    onFiltersChange({ search: '', categoryId: '', active: '' });
                  }
                : onCreate
            }
            className="w-full max-w-md border-solid border-border/70 bg-surface-elevated px-6 py-10 shadow-sm sm:px-10 sm:py-12"
          />
        </div>
      ) : effectiveViewMode === VIEW_MODE_CARDS ? (
        <AdminListCardGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {providers.map((provider) => (
            <ServiceProviderCard
              key={provider.id}
              provider={provider}
              categoryLogoUrl={categoryLogoForProvider(provider, categories)}
              onEdit={() => {
                onEdit(provider);
              }}
            />
          ))}
        </AdminListCardGrid>
      ) : (
        <ServiceProvidersTable
          providers={providers}
          busy={busy}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </section>
  );
};
