'use client';

import type { AdminServiceProviderItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

import {
  ServiceProvidersProvidersSection,
  type ServiceProviderFilters,
} from '@/features/admin/components/service-providers-providers-section';
import {
  useAdminServiceProviderCategoriesQuery,
  useAdminServiceProvidersQuery,
  useCreateServiceProviderMutation,
  useDeleteServiceProviderMutation,
  useUpdateServiceProviderMutation,
} from '@/features/admin/hooks/use-admin-service-providers';
import {
  toCreateServiceProviderBody,
  toUpdateServiceProviderBody,
} from '@/features/admin/utils/service-provider-mappers';
import { Reveal } from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';

/**
 * Admin service provider directory — providers CRUD (categories assigned on the form).
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

  const [editingProvider, setEditingProvider] = useState<AdminServiceProviderItem | null>(null);
  const [creatingProvider, setCreatingProvider] = useState(false);

  const createProviderMutation = useCreateServiceProviderMutation();
  const updateProviderMutation = useUpdateServiceProviderMutation();
  const deleteProviderMutation = useDeleteServiceProviderMutation();

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
    deleteProviderMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <Reveal force>
        <PageTitleBlock title={t('title')} subtitle={t('subtitle')} />
      </Reveal>

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
