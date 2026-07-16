'use client';

import { useState } from 'react';

import type { AdminReadinessCategoryRow } from '@/lib/admin/readiness-queries';
import { formatDateTime } from '@/lib/crm/format-crm-dates';

import { CategoryFormSheet } from './sheets/category-form-sheet';

type CategoriesTableProps = {
  locale: string;
  categories: AdminReadinessCategoryRow[];
  labels: {
    columns: {
      name: string;
      key: string;
      weight: string;
      sortOrder: string;
      serviceCategoryKey: string;
      active: string;
      updatedAt: string;
      actions: string;
    };
    edit: string;
    activeYes: string;
    activeNo: string;
    emptyValue: string;
  };
};

export function CategoriesTable({ locale, categories, labels }: CategoriesTableProps) {
  return (
    <div className="portal-table-wrap">
      <table className="portal-table">
        <thead>
          <tr>
            <th>{labels.columns.name}</th>
            <th>{labels.columns.key}</th>
            <th>{labels.columns.weight}</th>
            <th>{labels.columns.sortOrder}</th>
            <th>{labels.columns.serviceCategoryKey}</th>
            <th>{labels.columns.active}</th>
            <th>{labels.columns.updatedAt}</th>
            <th>{labels.columns.actions}</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => (
            <CategoryRow key={category.id} locale={locale} category={category} labels={labels} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

type CategoryRowProps = {
  locale: string;
  category: AdminReadinessCategoryRow;
  labels: CategoriesTableProps['labels'];
};

function CategoryRow({ locale, category, labels }: CategoryRowProps) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <tr>
      <td>{category.name}</td>
      <td>{category.key}</td>
      <td>{category.weight ?? labels.emptyValue}</td>
      <td>{category.sortOrder}</td>
      <td>{category.serviceCategoryKey ?? labels.emptyValue}</td>
      <td>{category.active ? labels.activeYes : labels.activeNo}</td>
      <td>{formatDateTime(category.updatedAt, locale)}</td>
      <td>
        <button
          type="button"
          className="portal-btn portal-btn--ghost portal-btn--sm"
          onClick={() => setEditOpen(true)}
        >
          {labels.edit}
        </button>
        <CategoryFormSheet
          locale={locale}
          mode="edit"
          open={editOpen}
          onClose={() => setEditOpen(false)}
          values={category}
        />
      </td>
    </tr>
  );
}
