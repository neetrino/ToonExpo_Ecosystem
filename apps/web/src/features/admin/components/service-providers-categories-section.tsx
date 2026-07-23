'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { ServiceProviderCategoryForm } from '@/features/admin/components/service-provider-category-form';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { Button } from '@/shared/ui/button';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { VIEW_MODE_CARDS } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

export type ServiceProvidersCategoriesSectionProps = {
  categories: ServiceProviderCategoryItem[];
  creating: boolean;
  editing: ServiceProviderCategoryItem | null;
  onCreate: () => void;
  onEdit: (category: ServiceProviderCategoryItem) => void;
  onDelete: (id: string) => void;
  onDone: () => void;
  busy: boolean;
};

export const ServiceProvidersCategoriesSection = ({
  categories,
  creating,
  editing,
  onCreate,
  onEdit,
  onDelete,
  onDone,
  busy,
}: ServiceProvidersCategoriesSectionProps) => {
  const t = useTranslations('Admin.serviceProviders.categories');
  const { viewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.serviceProviderCategories,
  );

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-semibold text-ink">{t('title')}</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button type="button" size="sm" variant="secondary" onClick={onCreate}>
            <AddActionLabel>{t('newCategory')}</AddActionLabel>
          </Button>
        </div>
      </div>

      <AdminCreateSheet open={creating} onClose={onDone} title={t('newCategory')}>
        <ServiceProviderCategoryForm onDone={onDone} />
      </AdminCreateSheet>

      <AdminCreateSheet open={editing != null} onClose={onDone} title={editing ? editing.name : ''}>
        {editing ? <ServiceProviderCategoryForm category={editing} onDone={onDone} /> : null}
      </AdminCreateSheet>

      {categories.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : viewMode === VIEW_MODE_CARDS ? (
        <AdminListCardGrid>
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium text-ink">{category.name}</span>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    className="text-sm font-medium text-brand hover:underline"
                    onClick={() => {
                      onEdit(category);
                    }}
                  >
                    {t('edit')}
                  </button>
                  <button
                    type="button"
                    className="text-sm font-medium text-danger hover:underline"
                    disabled={busy}
                    onClick={() => {
                      onDelete(category.id);
                    }}
                  >
                    {t('delete')}
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
                <span>
                  {t('columns.sort')}: {category.sortOrder}
                </span>
                <span aria-hidden>·</span>
                <span>{category.active ? t('activeYes') : t('activeNo')}</span>
              </div>
            </div>
          ))}
        </AdminListCardGrid>
      ) : (
        <div className="overflow-x-auto rounded-sm border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
            <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
              <tr>
                <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.sort')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.active')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border">
                  <td className="px-3 py-2.5 font-medium text-ink">{category.name}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">{category.sortOrder}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {category.active ? t('activeYes') : t('activeNo')}
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="text-sm font-medium text-brand hover:underline"
                        onClick={() => {
                          onEdit(category);
                        }}
                      >
                        {t('edit')}
                      </button>
                      <button
                        type="button"
                        className="text-sm font-medium text-danger hover:underline"
                        disabled={busy}
                        onClick={() => {
                          onDelete(category.id);
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
