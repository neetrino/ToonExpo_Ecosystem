'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { TranslationTabs } from '@/features/builder/components/translation-tabs';
import { APARTMENT_SALES_STATUSES, PRICE_VISIBILITY_OPTIONS } from '@/features/builder/constants';
import { useUpdateApartmentMutation } from '@/features/builder/hooks/use-portal-inventory';
import {
  updateApartmentSchema,
  type UpdateApartmentFormValues,
} from '@/features/builder/schemas/apartment.schema';
import {
  toApartmentFormValues,
  toApartmentUpdateRequest,
} from '@/features/builder/utils/apartment-form-mappers';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';
import { Textarea } from '@/shared/ui/textarea';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

type EditApartmentFormProps = {
  apartment: PortalApartmentDetail;
};

/**
 * Edit form for apartment parameters, price, sales status, and description.
 */
export const EditApartmentForm = ({ apartment }: EditApartmentFormProps) => {
  const t = useTranslations('Builder.apartments');
  const mutation = useUpdateApartmentMutation(apartment.id);
  const [formError, setFormError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateApartmentFormValues>({
    resolver: zodResolver(updateApartmentSchema),
    defaultValues: toApartmentFormValues(apartment),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      await mutation.mutateAsync(toApartmentUpdateRequest(values, apartment));
      showSuccess(t('saveSuccess'));
    } catch {
      setFormError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <>
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="apt-number"
          label={t('form.number')}
          error={errors.number ? t('validation.number') : undefined}
        >
          <Input id="apt-number" {...register('number')} />
        </FormField>
        <FormField id="apt-rooms" label={t('form.rooms')}>
          <Input id="apt-rooms" {...register('rooms')} />
        </FormField>
        <FormField id="apt-bedrooms" label={t('form.bedrooms')}>
          <Input id="apt-bedrooms" {...register('bedrooms')} />
        </FormField>
        <FormField id="apt-bathrooms" label={t('form.bathrooms')}>
          <Input id="apt-bathrooms" {...register('bathrooms')} />
        </FormField>
        <FormField id="apt-area-total" label={t('form.areaTotal')}>
          <Input id="apt-area-total" {...register('areaTotal')} />
        </FormField>
        <FormField id="apt-area-living" label={t('form.areaLiving')}>
          <Input id="apt-area-living" {...register('areaLiving')} />
        </FormField>
        <FormField id="apt-balcony" label={t('form.balconyArea')}>
          <Input id="apt-balcony" {...register('balconyArea')} />
        </FormField>
        <FormField id="apt-price" label={t('form.price')}>
          <Input id="apt-price" {...register('price')} />
        </FormField>
        <FormField id="apt-price-vis" label={t('form.priceVisibility')}>
          <Controller
            name="priceVisibility"
            control={control}
            render={({ field }) => (
              <Select
                id="apt-price-vis"
                name={field.name}
                value={field.value}
                aria-label={t('form.priceVisibility')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {PRICE_VISIBILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {t(`priceVisibility.${option}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
        <FormField id="apt-sales" label={t('form.salesStatus')}>
          <Controller
            name="salesStatus"
            control={control}
            render={({ field }) => (
              <Select
                id="apt-sales"
                name={field.name}
                value={field.value}
                aria-label={t('form.salesStatus')}
                onBlur={field.onBlur}
                onChange={(event) => {
                  field.onChange(event.target.value);
                }}
              >
                {APARTMENT_SALES_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {t(`salesStatus.${status}`)}
                  </option>
                ))}
              </Select>
            )}
          />
        </FormField>
        <FormField id="apt-finishing" label={t('form.finishingStatus')}>
          <Input id="apt-finishing" {...register('finishingStatus')} />
        </FormField>
      </div>

      <TranslationTabs>
        {(locale) => (
          <FormField id={`apt-desc-${locale}`} label={t('form.description')}>
            <Textarea
              id={`apt-desc-${locale}`}
              rows={3}
              {...register(
                locale === 'hy'
                  ? 'descriptionHy'
                  : locale === 'ru'
                    ? 'descriptionRu'
                    : 'descriptionEn',
              )}
            />
          </FormField>
        )}
      </TranslationTabs>

      <FormField id="apt-handover" label={t('form.handoverDescription')}>
        <Textarea id="apt-handover" rows={4} {...register('handoverDescription')} />
      </FormField>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          id="apt-matterport"
          label={t('form.matterportUrl')}
          error={errors.matterportUrl ? t('validation.invalidUrl') : undefined}
        >
          <Input
            id="apt-matterport"
            type="url"
            placeholder="https://"
            {...register('matterportUrl')}
          />
        </FormField>
        <FormField
          id="apt-external-3d"
          label={t('form.external3dUrl')}
          error={errors.external3dUrl ? t('validation.invalidUrl') : undefined}
        >
          <Input
            id="apt-external-3d"
            type="url"
            placeholder="https://"
            {...register('external3dUrl')}
          />
        </FormField>
      </div>

      {formError ? (
        <p role="alert" className="rounded-sm bg-danger-soft px-3 py-2 text-sm text-danger">
          {formError}
        </p>
      ) : null}
      <Button type="submit" variant="secondary" disabled={busy || !isDirty}>
        {busy ? t('saving') : t('save')}
      </Button>
    </form>
    {successToast}
    </>
  );
};
