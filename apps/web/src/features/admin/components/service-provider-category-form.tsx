'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import {
  useCreateServiceProviderCategoryMutation,
  useDeleteServiceProviderCategoryMutation,
  useUpdateServiceProviderCategoryMutation,
} from '@/features/admin/hooks/use-admin-service-providers';
import {
  serviceProviderCategorySchema,
  type ServiceProviderCategoryFormValues,
} from '@/features/admin/schemas/service-provider.schema';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';

type ServiceProviderCategoryFormProps = {
  category?: ServiceProviderCategoryItem | undefined;
  onDone: () => void;
};

/**
 * Create or edit a service provider category (always active).
 */
export const ServiceProviderCategoryForm = ({
  category,
  onDone,
}: ServiceProviderCategoryFormProps) => {
  const t = useTranslations('Admin.serviceProviders.categories.form');
  const tList = useTranslations('Admin.serviceProviders.categories');
  const createMutation = useCreateServiceProviderCategoryMutation();
  const updateMutation = useUpdateServiceProviderCategoryMutation(category?.id ?? '');
  const deleteMutation = useDeleteServiceProviderCategoryMutation();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const form = useForm<ServiceProviderCategoryFormValues>({
    resolver: zodResolver(serviceProviderCategorySchema),
    defaultValues: {
      name: category?.name ?? '',
      description: category?.description ?? '',
    },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      description: values.description || null,
      active: true,
    };
    if (category) {
      await updateMutation.mutateAsync(payload);
    } else {
      await createMutation.mutateAsync({
        name: payload.name,
        ...(values.description ? { description: values.description } : {}),
        active: true,
      });
    }
    onDone();
  });

  const busy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <FormField id="categoryName" label={t('name')}>
          <Input id="categoryName" {...form.register('name')} />
        </FormField>
        <FormField id="categoryDescription" label={t('description')}>
          <Textarea id="categoryDescription" rows={3} {...form.register('description')} />
        </FormField>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" size="sm" variant="primary" disabled={busy}>
            {category ? t('save') : t('create')}
          </Button>
          <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={onDone}>
            {t('cancel')}
          </Button>
          {category ? (
            <Button
              type="button"
              size="sm"
              variant="danger"
              disabled={busy}
              onClick={() => {
                setConfirmingDelete(true);
              }}
            >
              {tList('delete')}
            </Button>
          ) : null}
        </div>
      </form>

      <AdminDeleteModal
        open={confirmingDelete}
        title={t('deleteConfirmTitle')}
        message={category ? t('deleteConfirmMessage', { name: category.name }) : ''}
        confirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setConfirmingDelete(false);
          }
        }}
        onConfirm={() => {
          if (!category) {
            return;
          }
          void deleteMutation.mutateAsync(category.id).then(() => {
            setConfirmingDelete(false);
            onDone();
          });
        }}
      />
    </>
  );
};
