'use client';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useUpdateApartmentMutation } from '@/features/builder/hooks/use-portal-inventory';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import {
  optionalMediaIdField,
  toNullableMediaId,
} from '@/features/media/schemas/media-fields.schema';
import { Button } from '@/shared/ui/button';
import { useSuccessToast } from '@/shared/ui/use-success-toast';

const updateApartmentCoverSchema = z.object({
  coverMediaId: optionalMediaIdField,
});

type UpdateApartmentCoverFormValues = z.infer<typeof updateApartmentCoverSchema>;

type EditApartmentCoverFormProps = {
  apartment: PortalApartmentDetail;
};

/**
 * Sets or replaces the apartment listing/card cover image.
 */
export const EditApartmentCoverForm = ({ apartment }: EditApartmentCoverFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.apartments');
  const mutation = useUpdateApartmentMutation(apartment.id);
  const [error, setError] = useState<string | null>(null);
  const { showSuccess, successToast } = useSuccessToast();
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    apartment.cover?.fileUrl ?? null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting, isDirty },
  } = useForm<UpdateApartmentCoverFormValues>({
    resolver: zodResolver(updateApartmentCoverSchema),
    defaultValues: { coverMediaId: apartment.coverMediaId ?? '' },
  });

  useEffect(() => {
    reset({ coverMediaId: apartment.coverMediaId ?? '' });
    setPreviewUrl(apartment.cover?.fileUrl ?? null);
  }, [apartment.cover?.fileUrl, apartment.coverMediaId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      const updated = await mutation.mutateAsync({
        coverMediaId: toNullableMediaId(values.coverMediaId),
      });
      reset({ coverMediaId: updated.coverMediaId ?? '' });
      setPreviewUrl(updated.cover?.fileUrl ?? null);
      showSuccess(t('coverSaved'));
    } catch {
      setError(t('errors.generic'));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <>
    <form onSubmit={onSubmit} className="flex flex-col gap-3" noValidate>
      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`apartment-cover-${apartment.id}`}
            label={t('form.coverMedia')}
            context={mediaContext}
            value={field.value}
            onChange={(mediaAssetId) => {
              field.onChange(mediaAssetId);
              if (mediaAssetId.trim().length === 0) {
                setPreviewUrl(null);
              }
            }}
            onAssetSelected={(asset) => {
              setPreviewUrl(asset.fileUrl);
            }}
            previewUrl={previewUrl}
            error={fieldState.error?.message}
          />
        )}
      />
      {error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="sm" variant="secondary" disabled={busy || !isDirty}>
        {busy ? t('saving') : t('saveCover')}
      </Button>
    </form>
    {successToast}
    </>
  );
};
