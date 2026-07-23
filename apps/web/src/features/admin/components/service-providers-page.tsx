'use client';

import type { AdminServiceProviderItem, ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import { ServiceProvidersCategoriesSection } from '@/features/admin/components/service-providers-categories-section';
import {
  ServiceProvidersProvidersSection,
  type ServiceProviderFilters,
} from '@/features/admin/components/service-providers-providers-section';
import {
  useAdminServiceProviderCategoriesQuery,
  useAdminServiceProvidersQuery,
  useCreateServiceProviderMutation,
  useDeleteServiceProviderCategoryMutation,
  useDeleteServiceProviderMutation,
  useUpdateServiceProviderMutation,
} from '@/features/admin/hooks/use-admin-service-providers';
import {
  toCreateServiceProviderBody,
  toUpdateServiceProviderBody,
} from '@/features/admin/utils/service-provider-mappers';

/**
 * Admin service provider directory: categories + providers CRUD.
 */
export const ServiceProvidersPage = () => {
  const t = useTranslations('Admin.serviceProviders');
  const categoriesQuery = useAdminServiceProviderCategoriesQuery();
  const [providerFilters, setProviderFilters] = useState<ServiceProviderFilters>({
    search: '',
    active: '',
    categoryId: '',
  });

  const providersQuery = useAdminServiceProvidersQuery({
    ...(providerFilters.search ? { search: providerFilters.search } : {}),
    ...(providerFilters.categoryId ? { categoryId: providerFilters.categoryId } : {}),
    ...(providerFilters.active === 'true' ? { active: true } : {}),
    ...(providerFilters.active === 'false' ? { active: false } : {}),
  });

  const [editingCategory, setEditingCategory] = useState<ServiceProviderCategoryItem | null>(null);
  const [creatingCategory, setCreatingCategory] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AdminServiceProviderItem | null>(null);
  const [creatingProvider, setCreatingProvider] = useState(false);

  const createProviderMutation = useCreateServiceProviderMutation();
  const updateProviderMutation = useUpdateServiceProviderMutation();
  const deleteProviderMutation = useDeleteServiceProviderMutation();
  const deleteCategoryMutation = useDeleteServiceProviderCategoryMutation();

  if (categoriesQuery.isLoading || providersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (
    categoriesQuery.isError ||
    !categoriesQuery.data ||
    providersQuery.isError ||
    !providersQuery.data
  ) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const categories = categoriesQuery.data.data;
  const providers = providersQuery.data.data;
  const busy =
    createProviderMutation.isPending ||
    updateProviderMutation.isPending ||
    deleteProviderMutation.isPending ||
    deleteCategoryMutation.isPending;

  return (
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </header>

      <ServiceProvidersCategoriesSection
        categories={categories}
        creating={creatingCategory}
        editing={editingCategory}
        onCreate={() => {
          setCreatingCategory(true);
          setEditingCategory(null);
        }}
        onEdit={(category) => {
          setEditingCategory(category);
          setCreatingCategory(false);
        }}
        onDelete={(id) => {
          void deleteCategoryMutation.mutateAsync(id);
        }}
        onDone={() => {
          setCreatingCategory(false);
          setEditingCategory(null);
        }}
        busy={busy}
      />

      <ServiceProvidersProvidersSection
        categories={categories}
        providers={providers}
        filters={providerFilters}
        onFiltersChange={setProviderFilters}
        creating={creatingProvider}
        editing={editingProvider}
        onCreate={() => {
          setCreatingProvider(true);
          setEditingProvider(null);
        }}
        onEdit={(provider) => {
          setEditingProvider(provider);
          setCreatingProvider(false);
        }}
        onDelete={(id) => {
          void deleteProviderMutation.mutateAsync(id);
        }}
        onDone={() => {
          setCreatingProvider(false);
          setEditingProvider(null);
        }}
        onCreateSubmit={async (values) => {
          await createProviderMutation.mutateAsync(toCreateServiceProviderBody(values));
        }}
        onUpdateSubmit={async (id, values) => {
          await updateProviderMutation.mutateAsync({
            id,
            body: toUpdateServiceProviderBody(values),
          });
        }}
        busy={busy}
      />
    </div>
  );
};
