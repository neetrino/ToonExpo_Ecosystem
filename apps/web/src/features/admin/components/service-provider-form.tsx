'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import {
  SERVICE_PROVIDER_TYPES,
  serviceProviderSchema,
  type ServiceProviderFormValues,
} from '@/features/admin/schemas/service-provider.schema';
import { PARTNER_PUBLICATION_STATUSES } from '@/features/partners/constants';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';

type ServiceProviderFormProps = {
  categories: ServiceProviderCategoryItem[];
  defaultValues: ServiceProviderFormValues;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (values: ServiceProviderFormValues) => Promise<void>;
  isBusy: boolean;
};

/**
 * Admin create/edit form for service providers.
 */
export const ServiceProviderForm = ({
  categories,
  defaultValues,
  submitLabel,
  onCancel,
  onSubmit,
  isBusy,
}: ServiceProviderFormProps) => {
  const t = useTranslations('Admin.serviceProviders.providers.form');

  const form = useForm<ServiceProviderFormValues>({
    resolver: zodResolver(serviceProviderSchema),
    defaultValues,
  });

  const selectedCategoryIds = form.watch('categoryIds');

  const toggleCategory = (categoryId: string) => {
    const current = form.getValues('categoryIds');
    if (current.includes(categoryId)) {
      form.setValue(
        'categoryIds',
        current.filter((id) => id !== categoryId),
        { shouldDirty: true },
      );
      return;
    }
    form.setValue('categoryIds', [...current, categoryId], { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <FormField id="providerName" label={t('name')}>
        <Input id="providerName" {...form.register('name')} />
      </FormField>

      <FormField id="providerType" label={t('providerType')}>
        <Controller
          name="providerType"
          control={form.control}
          render={({ field }) => (
            <Select
              id="providerType"
              name={field.name}
              value={field.value}
              aria-label={t('providerType')}
              onBlur={field.onBlur}
              onChange={(event) => {
                field.onChange(event.target.value);
              }}
            >
              {SERVICE_PROVIDER_TYPES.map((type) => (
                <option key={type} value={type}>
                  {t(`types.${type}`)}
                </option>
              ))}
            </Select>
          )}
        />
      </FormField>

      <FormField id="providerDescription" label={t('description')}>
        <Textarea id="providerDescription" rows={3} {...form.register('description')} />
      </FormField>

      <FormField id="providerServices" label={t('services')}>
        <Textarea id="providerServices" rows={2} {...form.register('services')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="providerPhone" label={t('phone')}>
          <Input id="providerPhone" {...form.register('phone')} />
        </FormField>
        <FormField id="providerEmail" label={t('email')}>
          <Input id="providerEmail" type="email" {...form.register('email')} />
        </FormField>
      </div>

      <FormField id="providerWebsite" label={t('website')}>
        <Input id="providerWebsite" {...form.register('website')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-3">
        <FormField id="socialFacebook" label={t('socialFacebook')}>
          <Input id="socialFacebook" {...form.register('socialFacebook')} />
        </FormField>
        <FormField id="socialInstagram" label={t('socialInstagram')}>
          <Input id="socialInstagram" {...form.register('socialInstagram')} />
        </FormField>
        <FormField id="socialLinkedin" label={t('socialLinkedin')}>
          <Input id="socialLinkedin" {...form.register('socialLinkedin')} />
        </FormField>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium text-ink">{t('categories')}</legend>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const checked = selectedCategoryIds.includes(category.id);
            return (
              <label
                key={category.id}
                className="inline-flex items-center gap-2 rounded-sm border border-border px-3 py-1.5 text-sm"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => {
                    toggleCategory(category.id);
                  }}
                />
                {category.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <FormField id="internalNotes" label={t('internalNotes')}>
        <Textarea id="internalNotes" rows={3} {...form.register('internalNotes')} />
        <p className="mt-1 text-xs text-ink-muted">{t('internalNotesHint')}</p>
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField id="publicationStatus" label={t('publication')}>
          <Controller
            name="publicationStatus"
            control={form.control}
            render={({ field }) => (
              <Select
                id="publicationStatus"
                name={field.name}
                value={field.value ?? ''}
                aria-label={t('publication')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                <option value="">{t('publicationNone')}</option>
                {PARTNER_PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`publicationStatuses.${status}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-ink">
            <input type="checkbox" {...form.register('active')} />
            {t('active')}
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" size="sm" disabled={isBusy || form.formState.isSubmitting}>
          {submitLabel}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
