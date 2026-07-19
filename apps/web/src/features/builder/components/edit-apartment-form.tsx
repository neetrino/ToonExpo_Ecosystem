'use client';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalApartmentDetail, UpdatePortalApartmentRequest } from '@toonexpo/contracts';
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
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import {
  toNullableHttpsUrl,
  toNullableMediaId,
} from '@/features/media/schemas/media-fields.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type EditApartmentFormProps = {
  apartment: PortalApartmentDetail;
};

const optionalNumber = (value: string): number | null => {
  if (value.trim().length === 0) {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const toFormValues = (apartment: PortalApartmentDetail): UpdateApartmentFormValues => ({
  number: apartment.number,
  rooms: apartment.rooms?.toString() ?? '',
  bedrooms: apartment.bedrooms?.toString() ?? '',
  bathrooms: apartment.bathrooms?.toString() ?? '',
  areaTotal: apartment.areaTotal ?? '',
  areaLiving: apartment.areaLiving ?? '',
  balconyArea: apartment.balconyArea ?? '',
  price: apartment.price ?? '',
  priceVisibility: apartment.priceVisibility,
  salesStatus: apartment.salesStatus,
  statusChangeReason: '',
  descriptionHy: apartment.translations?.description?.hy ?? apartment.description ?? '',
  descriptionRu: apartment.translations?.description?.ru ?? '',
  descriptionEn: apartment.translations?.description?.en ?? '',
  planMediaId: apartment.planMediaId ?? '',
  matterportUrl: apartment.matterportUrl ?? '',
  external3dUrl: apartment.external3dUrl ?? '',
});

const toUpdateRequest = (
  values: UpdateApartmentFormValues,
  previousStatus: PortalApartmentDetail['salesStatus'],
): UpdatePortalApartmentRequest => {
  const description = {
    ...(values.descriptionHy.length > 0 ? { hy: values.descriptionHy } : {}),
    ...(values.descriptionRu.length > 0 ? { ru: values.descriptionRu } : {}),
    ...(values.descriptionEn.length > 0 ? { en: values.descriptionEn } : {}),
  };
  const statusChanged = values.salesStatus !== previousStatus;

  return {
    number: values.number,
    rooms: optionalNumber(values.rooms),
    bedrooms: optionalNumber(values.bedrooms),
    bathrooms: optionalNumber(values.bathrooms),
    areaTotal: optionalNumber(values.areaTotal),
    areaLiving: optionalNumber(values.areaLiving),
    balconyArea: optionalNumber(values.balconyArea),
    price: optionalNumber(values.price),
    priceVisibility: values.priceVisibility,
    salesStatus: values.salesStatus,
    ...(statusChanged && values.statusChangeReason.length > 0
      ? { statusChangeReason: values.statusChangeReason }
      : {}),
    description: values.descriptionHy.length > 0 ? values.descriptionHy : null,
    ...(Object.keys(description).length > 0 ? { translations: { description } } : {}),
    planMediaId: toNullableMediaId(values.planMediaId),
    matterportUrl: toNullableHttpsUrl(values.matterportUrl),
    external3dUrl: toNullableHttpsUrl(values.external3dUrl),
  };
};

/**
 * Edit form for apartment parameters, price, sales status, and description.
 */
export const EditApartmentForm = ({ apartment }: EditApartmentFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.apartments');
  const mutation = useUpdateApartmentMutation(apartment.id);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<UpdateApartmentFormValues>({
    resolver: zodResolver(updateApartmentSchema),
    defaultValues: toFormValues(apartment),
  });

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);
    setSuccess(false);
    try {
      await mutation.mutateAsync(toUpdateRequest(values, apartment.salesStatus));
      setSuccess(true);
    } catch {
      setFormError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || mutation.isPending;
  const selectClassName =
    'h-11 w-full rounded-sm border border-border bg-background px-4 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20';

  return (
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
          <select id="apt-price-vis" className={selectClassName} {...register('priceVisibility')}>
            {PRICE_VISIBILITY_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {t(`priceVisibility.${option}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="apt-sales" label={t('form.salesStatus')}>
          <select id="apt-sales" className={selectClassName} {...register('salesStatus')}>
            {APARTMENT_SALES_STATUSES.map((status) => (
              <option key={status} value={status}>
                {t(`salesStatus.${status}`)}
              </option>
            ))}
          </select>
        </FormField>
        <FormField id="apt-reason" label={t('form.statusChangeReason')}>
          <Input id="apt-reason" {...register('statusChangeReason')} />
        </FormField>
      </div>

      <TranslationTabs>
        {(locale) => (
          <FormField id={`apt-desc-${locale}`} label={t('form.description')}>
            <textarea
              id={`apt-desc-${locale}`}
              rows={3}
              className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-ink focus-visible:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/20"
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

      <Controller
        control={control}
        name="planMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="apt-plan"
            label={t('form.planMedia')}
            context={mediaContext}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />

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
      {success ? (
        <p role="status" className="text-sm text-success">
          {t('saveSuccess')}
        </p>
      ) : null}

      <Button type="submit" variant="secondary" disabled={busy || !isDirty}>
        {busy ? t('saving') : t('save')}
      </Button>
    </form>
  );
};
