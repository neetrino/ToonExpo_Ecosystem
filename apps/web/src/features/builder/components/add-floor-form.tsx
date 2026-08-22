'use client';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { useCreateFloorMutation } from '@/features/builder/hooks/use-portal-inventory';
import {
  createFloorSchema,
  type CreateFloorFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { toOptionalMediaId } from '@/features/media/schemas/media-fields.schema';
import { isFloorNumberDuplicateApiError } from '@/shared/api/errors';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

type AddFloorFormProps = {
  projectId: string;
  buildingId: string;
  onSuccess?: (() => void) | undefined;
};

/**
 * Form to add a floor to a building.
 */
export const AddFloorForm = ({ projectId, buildingId, onSuccess }: AddFloorFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.inventory');
  const mutation = useCreateFloorMutation(projectId, buildingId);
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { floorNumber: t('floorNumber'), floorplanMediaId: t('floorplanMedia') },
  });
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateFloorFormValues>({
    resolver: zodResolver(createFloorSchema),
    defaultValues: {
      floorNumber: '1',
      name: '',
      displayLabel: '',
      floorplanMediaId: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const floorNumber = Number(values.floorNumber);
      await mutation.mutateAsync({
        floorNumber,
        ...(values.name.length > 0 ? { name: values.name } : {}),
        ...(values.displayLabel.length > 0 ? { displayLabel: values.displayLabel } : {}),
        ...(toOptionalMediaId(values.floorplanMediaId)
          ? { floorplanMediaId: values.floorplanMediaId }
          : {}),
      });
      reset({
        floorNumber: String(floorNumber + 1),
        name: '',
        displayLabel: '',
        floorplanMediaId: '',
      });
      onSuccess?.();
    } catch (caught) {
      if (isFloorNumberDuplicateApiError(caught)) {
        showError(t('errors.floorNumberExists', { number: values.floorNumber }));
        return;
      }
      showError(t('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id={`floor-number-${buildingId}`}
          label={t('floorNumber')}
          error={errors.floorNumber ? t('validation.floorNumber') : undefined}
        >
          <Input id={`floor-number-${buildingId}`} type="number" {...register('floorNumber')} />
        </FormField>
        <FormField id={`floor-name-${buildingId}`} label={t('floorName')}>
          <Input id={`floor-name-${buildingId}`} {...register('name')} />
        </FormField>
        <FormField id={`floor-label-${buildingId}`} label={t('displayLabel')}>
          <Input id={`floor-label-${buildingId}`} {...register('displayLabel')} />
        </FormField>
      </div>
      <Controller
        control={control}
        name="floorplanMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id={`floor-plan-new-${buildingId}`}
            label={t('floorplanMedia')}
            context={mediaContext}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? t('adding') : t('addFloor')}
      </Button>
      {errorToast}
    </form>
  );
};
