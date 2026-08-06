'use client';

import type { ReadinessCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ReadinessCategoryCard } from '@/features/admin/components/readiness-category-card';
import { ReadinessCategoryForm } from '@/features/admin/components/readiness-category-form';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminReadinessCategoriesQuery } from '@/features/admin/hooks/use-admin-readiness';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { BackLink } from '@/shared/ui/back-link';
import { Button } from '@/shared/ui/button';
import { VIEW_MODE_CARDS } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

/**
 * Admin readiness categories list with inline create/edit panel.
 */
export const ReadinessCategoriesPage = () => {
  const t = useTranslations('Admin.readiness.categories');
  const query = useAdminReadinessCategoriesQuery();
  const [editing, setEditing] = useState<ReadinessCategoryItem | null>(null);
  const [creating, setCreating] = useState(false);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.readinessCategories,
  );

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

  const categories = query.data.data;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-2">
          <BackLink href="/admin/readiness" label={t('backToAssessments')} />
          <h1 className="text-page-title text-ink">{t('title')}</h1>
          <p className="max-w-xl text-sm text-ink-secondary">{t('subtitle')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
        </div>
      </div>

      <AdminCreateSheet
        open={creating}
        onClose={() => {
          setCreating(false);
        }}
        title={t('createTitle')}
      >
        <ReadinessCategoryForm
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
          <ReadinessCategoryForm
            category={editing}
            onDone={() => {
              setEditing(null);
            }}
          />
        ) : null}
      </AdminCreateSheet>

      {categories.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : effectiveViewMode === VIEW_MODE_CARDS ? (
        <AdminListCardGrid className="gap-4 xl:grid-cols-4">
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
                <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.weight')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.sort')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.active')}</th>
                <th className="px-3 py-2 font-medium">{t('columns.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.id} className="border-t border-border hover:bg-surface/60">
                  <td className="px-3 py-2.5 font-medium text-ink">{category.name}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">{category.weight ?? '—'}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">{category.sortOrder}</td>
                  <td className="px-3 py-2.5 text-ink-secondary">
                    {category.active ? t('activeYes') : t('activeNo')}
                  </td>
                  <td className="px-3 py-2.5">
                    <button
                      type="button"
                      className="text-sm font-medium text-brand hover:underline"
                      onClick={() => {
                        setEditing(category);
                        setCreating(false);
                      }}
                    >
                      {t('edit')}
                    </button>
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
