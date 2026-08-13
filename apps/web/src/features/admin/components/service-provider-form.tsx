'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { ServiceProviderCategorySelect } from '@/features/admin/components/service-provider-category-select';
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

const selectedCategoryId = (categoryIds: readonly string[]): string => categoryIds[0] ?? '';

const toCategoryIds = (categoryId: string): string[] => (categoryId.length > 0 ? [categoryId] : []);

/**
 * Admin create/edit form for service providers (side sheet).
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

  const busy = isBusy || form.formState.isSubmitting;

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit({ ...values, active: defaultValues.active });
  });

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
      <fieldset className="flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('sections.provider')}
        </legend>
        <div className="grid grid-cols-2 items-end gap-3">
          <FormField id="providerName" label={t('name')}>
            <Input
              id="providerName"
              placeholder={t('placeholders.name')}
              {...form.register('name')}
            />
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
        </div>
        <FormField id="providerDescription" label={t('description')}>
          <Textarea
            id="providerDescription"
            rows={2}
            placeholder={t('placeholders.description')}
            {...form.register('description')}
          />
        </FormField>
        <FormField id="providerServices" label={t('services')}>
          <Textarea
            id="providerServices"
            rows={2}
            placeholder={t('placeholders.services')}
            {...form.register('services')}
          />
        </FormField>
        <FormField id="providerCategory" label={t('categories')}>
          <Controller
            name="categoryIds"
            control={form.control}
            render={({ field }) => (
              <ServiceProviderCategorySelect
                id="providerCategory"
                categories={categories}
                value={selectedCategoryId(field.value)}
                disabled={busy}
                onBlur={field.onBlur}
                onChange={(categoryId) => {
                  field.onChange(toCategoryIds(categoryId));
                }}
              />
            )}
          />
        </FormField>
      </fieldset>

      <fieldset className="mt-2 flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('sections.contact')}
        </legend>
        <div className="grid grid-cols-2 items-end gap-3">
          <FormField id="providerPhone" label={t('phone')}>
            <Input
              id="providerPhone"
              type="tel"
              placeholder={t('placeholders.phone')}
              {...form.register('phone')}
            />
          </FormField>
          <FormField id="providerEmail" label={t('email')}>
            <Input
              id="providerEmail"
              type="email"
              placeholder={t('placeholders.email')}
              {...form.register('email')}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 items-end gap-3">
          <FormField id="providerWebsite" label={t('website')}>
            <Input
              id="providerWebsite"
              type="url"
              placeholder={t('placeholders.website')}
              {...form.register('website')}
            />
          </FormField>
          <FormField id="socialLinkedin" label={t('socialLinkedin')}>
            <Input
              id="socialLinkedin"
              type="url"
              placeholder={t('placeholders.socialLinkedin')}
              {...form.register('socialLinkedin')}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-2 items-end gap-3">
          <FormField id="socialFacebook" label={t('socialFacebook')}>
            <Input
              id="socialFacebook"
              type="url"
              placeholder={t('placeholders.socialFacebook')}
              {...form.register('socialFacebook')}
            />
          </FormField>
          <FormField id="socialInstagram" label={t('socialInstagram')}>
            <Input
              id="socialInstagram"
              type="url"
              placeholder={t('placeholders.socialInstagram')}
              {...form.register('socialInstagram')}
            />
          </FormField>
        </div>
      </fieldset>

      <fieldset className="mt-2 flex flex-col gap-3">
        <legend className="mb-2.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
          {t('sections.publishing')}
        </legend>
        <FormField id="internalNotes" label={t('internalNotes')}>
          <Textarea
            id="internalNotes"
            rows={2}
            placeholder={t('placeholders.internalNotes')}
            {...form.register('internalNotes')}
          />
          <p className="mt-1 text-xs text-ink-muted">{t('internalNotesHint')}</p>
        </FormField>
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
      </fieldset>

      <div className="flex flex-wrap gap-2">
        <Button type="submit" variant="primary" disabled={busy} className="flex-1">
          {busy ? t('saving') : submitLabel}
        </Button>
        <Button type="button" variant="ghost" disabled={busy} className="flex-1" onClick={onCancel}>
          {t('cancel')}
        </Button>
      </div>
    </form>
  );
};
