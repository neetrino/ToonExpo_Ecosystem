'use client';

import type {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from 'react-hook-form';
import { useTranslations } from 'next-intl';

import type { CompanyContactFieldsValues } from '@/features/companies/schemas/company-contact-fields.schema';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';

type CompanyContactFieldsProps<TFieldValues extends FieldValues> = {
  register: UseFormRegister<TFieldValues>;
  errors: FieldErrors<TFieldValues>;
  idPrefix: string;
  labelsNamespace: 'Admin.companies' | 'Builder.company';
};

const field = <TFieldValues extends FieldValues>(name: keyof CompanyContactFieldsValues) =>
  name as Path<TFieldValues>;

/**
 * Shared contact / region / materials inputs for company profile editors.
 */
export const CompanyContactFields = <TFieldValues extends FieldValues>({
  register,
  errors,
  idPrefix,
  labelsNamespace,
}: CompanyContactFieldsProps<TFieldValues>) => {
  const t = useTranslations(labelsNamespace);
  const fieldErrors = errors as FieldErrors<CompanyContactFieldsValues>;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <FormField
        id={`${idPrefix}-phone`}
        label={t('form.phone')}
        error={fieldErrors.phone ? t('validation.phone') : undefined}
      >
        <Input id={`${idPrefix}-phone`} type="tel" {...register(field<TFieldValues>('phone'))} />
      </FormField>

      <FormField
        id={`${idPrefix}-contact-person`}
        label={t('form.contactPerson')}
        error={fieldErrors.contactPerson ? t('validation.contactPerson') : undefined}
      >
        <Input
          id={`${idPrefix}-contact-person`}
          {...register(field<TFieldValues>('contactPerson'))}
        />
      </FormField>

      <FormField
        id={`${idPrefix}-email`}
        label={t('form.email')}
        error={fieldErrors.email ? t('validation.email') : undefined}
      >
        <Input
          id={`${idPrefix}-email`}
          type="email"
          {...register(field<TFieldValues>('email'))}
        />
      </FormField>

      <FormField
        id={`${idPrefix}-website`}
        label={t('form.websiteUrl')}
        error={fieldErrors.websiteUrl ? t('validation.url') : undefined}
      >
        <Input
          id={`${idPrefix}-website`}
          type="url"
          placeholder="https://"
          {...register(field<TFieldValues>('websiteUrl'))}
        />
      </FormField>

      <FormField
        id={`${idPrefix}-instagram`}
        label={t('form.instagramUrl')}
        error={fieldErrors.instagramUrl ? t('validation.url') : undefined}
      >
        <Input
          id={`${idPrefix}-instagram`}
          type="url"
          placeholder="https://"
          {...register(field<TFieldValues>('instagramUrl'))}
        />
      </FormField>

      <FormField
        id={`${idPrefix}-facebook`}
        label={t('form.facebookUrl')}
        error={fieldErrors.facebookUrl ? t('validation.url') : undefined}
      >
        <Input
          id={`${idPrefix}-facebook`}
          type="url"
          placeholder="https://"
          {...register(field<TFieldValues>('facebookUrl'))}
        />
      </FormField>

      <FormField
        id={`${idPrefix}-region`}
        label={t('form.region')}
        error={fieldErrors.region ? t('validation.region') : undefined}
      >
        <Input id={`${idPrefix}-region`} {...register(field<TFieldValues>('region'))} />
      </FormField>

      <FormField
        id={`${idPrefix}-address`}
        label={t('form.address')}
        error={fieldErrors.address ? t('validation.address') : undefined}
      >
        <Input id={`${idPrefix}-address`} {...register(field<TFieldValues>('address'))} />
      </FormField>

      <FormField
        id={`${idPrefix}-media-materials`}
        label={t('form.mediaMaterialsUrl')}
        error={fieldErrors.mediaMaterialsUrl ? t('validation.url') : undefined}
      >
        <Input
          id={`${idPrefix}-media-materials`}
          type="url"
          placeholder="https://"
          {...register(field<TFieldValues>('mediaMaterialsUrl'))}
        />
      </FormField>

      <FormField
        id={`${idPrefix}-advertising-materials`}
        label={t('form.advertisingMaterialsUrl')}
        error={fieldErrors.advertisingMaterialsUrl ? t('validation.url') : undefined}
      >
        <Input
          id={`${idPrefix}-advertising-materials`}
          type="url"
          placeholder="https://"
          {...register(field<TFieldValues>('advertisingMaterialsUrl'))}
        />
      </FormField>
    </div>
  );
};
