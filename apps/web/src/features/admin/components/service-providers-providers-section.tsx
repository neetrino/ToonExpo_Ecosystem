'use client';

import type { AdminServiceProviderItem, ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { ServiceProviderForm } from '@/features/admin/components/service-provider-form';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import type { ServiceProviderFormValues } from '@/features/admin/schemas/service-provider.schema';
import { toServiceProviderFormValues } from '@/features/admin/utils/service-provider-mappers';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { VIEW_MODE_CARDS } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

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
  const t = useTranslations('Admin.serviceProviders.providers');
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.serviceProviders);

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{t('title')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button type="button" size="sm" variant="secondary" onClick={onCreate}>
            <AddActionLabel>{t('newProvider')}</AddActionLabel>
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          className="h-10 rounded-sm border border-border bg-background px-3 text-sm"
          placeholder={t('filters.searchPlaceholder')}
          value={filters.search}
          onChange={(event) => {
            onFiltersChange({ ...filters, search: event.target.value });
          }}
        />
        <Select
          size="fit"
          className="h-10"
          value={filters.categoryId}
          aria-label={t('filters.allCategories')}
          onChange={(event) => {
            onFiltersChange({ ...filters, categoryId: event.target.value });
          }}
        >
          <option value="">{t('filters.allCategories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
        <Select
          size="fit"
          className="h-10"
          value={filters.active}
          aria-label={t('filters.allActive')}
          onChange={(event) => {
            onFiltersChange({
              ...filters,
              active: event.target.value as '' | 'true' | 'false',
            });
          }}
        >
          <option value="">{t('filters.allActive')}</option>
          <option value="true">{t('filters.active')}</option>
          <option value="false">{t('filters.inactive')}</option>
        </Select>
      </div>

      <AdminCreateSheet
        open={creating}
        onClose={onDone}
        title={t('newProvider')}
        size="comfortable"
      >
        <ServiceProviderForm
          key="create"
          categories={categories}
          defaultValues={EMPTY_PROVIDER_DEFAULTS}
          submitLabel={t('create')}
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
      >
        {editing ? (
          <ServiceProviderForm
            key={editing.id}
            categories={categories}
            defaultValues={toServiceProviderFormValues(editing)}
            submitLabel={t('save')}
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
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : viewMode === VIEW_MODE_CARDS ? (
        <AdminListCardGrid>
          {providers.map((provider) => (
            <div
              key={provider.id}
              className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-ink">{provider.name}</span>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-brand hover:underline"
                    onClick={() => {
                      onEdit(provider);
                    }}
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-danger hover:underline"
                    disabled={busy}
                    onClick={() => {
                      onDelete(provider.id);
                    }}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                <span>{t(`form.types.${provider.providerType}`)}</span>
                <span aria-hidden>·</span>
                <span>{provider.active ? t('activeYes') : t('activeNo')}</span>
              </div>
              <p className="text-xs text-ink-secondary">
                {provider.categories.map((c) => c.name).join(', ') || '—'}
              </p>
            </div>
          ))}
        </AdminListCardGrid>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.type')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.categories')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.active')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider) => (
                <tr key={provider.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-ink">{provider.name}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {t(`form.types.${provider.providerType}`)}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {provider.categories.map((c) => c.name).join(', ') || '—'}
                  </td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {provider.active ? t('activeYes') : t('activeNo')}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-sm font-medium text-brand hover:underline"
                        onClick={() => {
                          onEdit(provider);
                        }}
                      >
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-danger hover:underline"
                        disabled={busy}
                        onClick={() => {
                          onDelete(provider.id);
                        }}
                      >
                        {t('delete')}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
