'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';

import {
  useCreateServiceProviderCategoryMutation,
  useUpdateServiceProviderCategoryMutation,
} from '@/features/admin/hooks/use-admin-service-providers';
import {
  serviceProviderCategorySchema,
  type ServiceProviderCategoryFormValues,
} from '@/features/admin/schemas/service-provider.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type ServiceProviderCategoryFormProps = {
  category?: ServiceProviderCategoryItem | undefined;
  onDone: () => void;
};

/**
 * Inline form for admin service provider categories.
 */
export const ServiceProviderCategoryForm = ({
  category,
  onDone,
}: ServiceProviderCategoryFormProps) => {
  const t = useTranslations('Admin.serviceProviders.categories.form');
  const createMutation = useCreateServiceProviderCategoryMutation();
  const updateMutation = useUpdateServiceProviderCategoryMutation(category?.id ?? '');

  const form = useForm<ServiceProviderCategoryFormValues>({
    resolver: zodResolver(serviceProviderCategorySchema),
    defaultValues: category
      ? {
          name: category.name,
          description: category.description ?? '',
          sortOrder: category.sortOrder,
          active: category.active,
        }
      : {
          name: '',
          description: '',
          sortOrder: 0,
          active: true,
        },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    if (category) {
      await updateMutation.mutateAsync({
        name: values.name,
        description: values.description || null,
        sortOrder: values.sortOrder,
        active: values.active,
      });
    } else {
      await createMutation.mutateAsync({
        name: values.name,
        ...(values.description ? { description: values.description } : {}),
        sortOrder: values.sortOrder,
        active: values.active,
      });
    }
    onDone();
  });

  const busy = createMutation.isPending || updateMutation.isPending;

  return (
    <form className="flex flex-col gap-4" onSubmit={onSubmit}>
      <FormField id="categoryName" label={t('name')}>
        <Input id="categoryName" {...form.register('name')} />
      </FormField>
      <FormField id="categoryDescription" label={t('description')}>
        <Textarea id="categoryDescription" rows={3} {...form.register('description')} />
      </FormField>
      <FormField id="categorySortOrder" label={t('sortOrder')}>
        <Input
          id="categorySortOrder"
          type="number"
          {...form.register('sortOrder', { valueAsNumber: true })}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-ink">
        <input type="checkbox" {...form.register('active')} />
        {t('active')}
      </label>
      <div className="flex gap-2">
        <Button type="submit" size="sm" variant="primary" disabled={busy}>
          {category ? t('save') : t('create')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
