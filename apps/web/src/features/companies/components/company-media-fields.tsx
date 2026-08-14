'use client';

import { useTranslations } from 'next-intl';
import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';

import type { MediaUploadContext } from '@/features/media/api/media-api';
import { MediaUploadField } from '@/features/media/components/media-upload-field';

export type CompanyMediaFieldValues = {
  logoMediaId: string;
  coverMediaId: string;
};

type CompanyMediaFieldsProps = {
  control: Control<CompanyMediaFieldValues>;
  context: MediaUploadContext;
  logoPreviewUrl?: string | null | undefined;
  coverPreviewUrl?: string | null | undefined;
};

/**
 * Logo and cover image pickers for admin company forms.
 */
export const CompanyMediaFields = ({
  control,
  context,
  logoPreviewUrl,
  coverPreviewUrl,
}: CompanyMediaFieldsProps) => {
  const t = useTranslations('Admin.companies.form');

  return (
    <div className="grid min-h-0 items-start gap-4 sm:grid-cols-2">
      <Controller
        control={control}
        name="logoMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="edit-company-logo"
            label={t('logoMedia')}
            context={context}
            value={field.value}
            onChange={field.onChange}
            previewUrl={logoPreviewUrl}
            description={t('logoMediaHint')}
            error={fieldState.error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="edit-company-cover"
            label={t('coverMedia')}
            context={context}
            value={field.value}
            onChange={field.onChange}
            previewUrl={coverPreviewUrl}
            description={t('coverMediaHint')}
            error={fieldState.error?.message}
          />
        )}
      />
    </div>
  );
};
