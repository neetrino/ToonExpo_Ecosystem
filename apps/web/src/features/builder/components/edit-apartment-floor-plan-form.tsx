'use client';

import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { portalApartmentQueryKey } from '@/features/builder/constants';
import { useRegisterApartmentEditSubForm } from '@/features/builder/context/apartment-edit-subforms-context';
import { useUpdateFloorMutation } from '@/features/builder/hooks/use-portal-inventory';
import { zodResolver } from '@hookform/resolvers/zod';
import type { PortalApartmentDetail } from '@toonexpo/contracts';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';

import { MediaUploadField } from '@/features/media/components/media-upload-field';
import {
  optionalMediaIdField,
  toNullableMediaId,
} from '@/features/media/schemas/media-fields.schema';

const updateApartmentFloorPlanSchema = z.object({
  floorplanMediaId: optionalMediaIdField,
});

type UpdateApartmentFloorPlanFormValues = z.infer<typeof updateApartmentFloorPlanSchema>;

type EditApartmentFloorPlanFormProps = {
  apartment: PortalApartmentDetail;
};

/**
 * Sets the shared floor plan for this apartment's floor.
 */
export const EditApartmentFloorPlanForm = ({ apartment }: EditApartmentFloorPlanFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const queryClient = useQueryClient();
  const t = useTranslations('Builder.apartments');
  const mutation = useUpdateFloorMutation(apartment.projectId, apartment.floorId);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    apartment.floorplan?.fileUrl ?? null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { isDirty },
  } = useForm<UpdateApartmentFloorPlanFormValues>({
    resolver: zodResolver(updateApartmentFloorPlanSchema),
    defaultValues: { floorplanMediaId: apartment.floorplanMediaId ?? '' },
  });

  useEffect(() => {
    reset({ floorplanMediaId: apartment.floorplanMediaId ?? '' });
    setPreviewUrl(apartment.floorplan?.fileUrl ?? null);
  }, [apartment.floorplan?.fileUrl, apartment.floorplanMediaId, reset]);

  const save = useCallback(async (): Promise<void> => {
    await new Promise<void>((resolve, reject) => {
      void handleSubmit(async (values) => {
        setError(null);
        try {
          const nextId = toNullableMediaId(values.floorplanMediaId);
          await mutation.mutateAsync({ floorplanMediaId: nextId });
          reset({ floorplanMediaId: nextId ?? '' });
          await queryClient.invalidateQueries({
            queryKey: [...portalApartmentQueryKey(apartment.id), scope],
          });
          resolve();
        } catch (saveError) {
          setError(t('errors.generic'));
          reject(saveError);
        }
      }, reject)();
    });
  }, [apartment.id, handleSubmit, mutation, queryClient, reset, scope, t]);

  useRegisterApartmentEditSubForm({
    id: `apartment-floorplan-${apartment.id}`,
    isDirty,
    save,
  });

  return (
    <div className="flex flex-col gap-3">
      <Controller
        control={control}
        name="floorplanMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`apartment-floor-plan-${apartment.id}`}
            label={t('form.floorplanMedia')}
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
