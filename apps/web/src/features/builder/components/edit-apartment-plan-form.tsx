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

const updateApartmentPlanSchema = z.object({
  planMediaId: optionalMediaIdField,
});

type UpdateApartmentPlanFormValues = z.infer<typeof updateApartmentPlanSchema>;

type EditApartmentPlanFormProps = {
  apartment: PortalApartmentDetail;
};

/**
 * Sets the unit-specific apartment plan image (independent of floor plan).
 */
export const EditApartmentPlanForm = ({ apartment }: EditApartmentPlanFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.apartments');
  const mutation = useUpdateApartmentMutation(apartment.id);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(apartment.plan?.fileUrl ?? null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateApartmentPlanFormValues>({
    resolver: zodResolver(updateApartmentPlanSchema),
    defaultValues: { planMediaId: apartment.planMediaId ?? '' },
  });

  useEffect(() => {
    reset({ planMediaId: apartment.planMediaId ?? '' });
    setPreviewUrl(apartment.plan?.fileUrl ?? null);
  }, [apartment.plan?.fileUrl, apartment.planMediaId, reset]);

  const save = useCallback(async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      void handleSubmit(async (values) => {
        setError(null);
        try {
          const updated = await mutation.mutateAsync({
            planMediaId: toNullableMediaId(values.planMediaId),
          });
          reset({ planMediaId: updated.planMediaId ?? '' });
          setPreviewUrl(updated.plan?.fileUrl ?? null);
          resolve();
        } catch (saveError) {
          setError(t('errors.generic'));
          reject(saveError);
        }
      }, reject)();
    });
  }, [handleSubmit, mutation, reset, t]);

  useRegisterApartmentEditSubForm({
    id: `apartment-plan-${apartment.id}`,
    isDirty,
    save,
  });

  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="planMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`apartment-plan-${apartment.id}`}
            label={t('form.planMedia')}
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
