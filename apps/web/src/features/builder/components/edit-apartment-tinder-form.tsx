'use client';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { useRegisterApartmentEditSubForm } from '@/features/builder/context/apartment-edit-subforms-context';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { useUpdateApartmentMutation } from '@/features/builder/hooks/use-portal-inventory';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import {
  optionalMediaIdField,
  toNullableMediaId,
} from '@/features/media/schemas/media-fields.schema';

const updateApartmentTinderSchema = z.object({
  tinderMediaId: optionalMediaIdField,
});

type UpdateApartmentTinderFormValues = z.infer<typeof updateApartmentTinderSchema>;

type EditApartmentTinderFormProps = {
  apartment: PortalApartmentDetail;
};

/**
 * Sets the Discover / Tinder swipe-card image for this apartment.
 */
export const EditApartmentTinderForm = ({ apartment }: EditApartmentTinderFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.apartments');
  const mutation = useUpdateApartmentMutation(apartment.id);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    apartment.tinder?.fileUrl ?? null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateApartmentTinderFormValues>({
    resolver: zodResolver(updateApartmentTinderSchema),
    defaultValues: { tinderMediaId: apartment.tinderMediaId ?? '' },
  });

  useEffect(() => {
    reset({ tinderMediaId: apartment.tinderMediaId ?? '' });
    setPreviewUrl(apartment.tinder?.fileUrl ?? null);
  }, [apartment.tinder?.fileUrl, apartment.tinderMediaId, reset]);

  const save = useCallback(async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      void handleSubmit(async (values) => {
        setError(null);
        try {
          const updated = await mutation.mutateAsync({
            tinderMediaId: toNullableMediaId(values.tinderMediaId),
          });
          reset({ tinderMediaId: updated.tinderMediaId ?? '' });
          setPreviewUrl(updated.tinder?.fileUrl ?? null);
          resolve();
        } catch (saveError) {
          setError(t('errors.generic'));
          reject(saveError);
        }
      }, reject)();
    });
  }, [handleSubmit, mutation, reset, t]);

  useRegisterApartmentEditSubForm({
    id: `apartment-tinder-${apartment.id}`,
    isDirty,
    save,
  });

  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="tinderMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`apartment-tinder-${apartment.id}`}
            label={t('form.tinderMedia')}
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
    </div>
  );
};
