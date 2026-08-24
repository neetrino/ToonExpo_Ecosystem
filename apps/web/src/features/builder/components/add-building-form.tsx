'use client';

import { useCatalogScope } from '@/features/builder/catalog-scope-context';
import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';

import { useCreateBuildingMutation } from '@/features/builder/hooks/use-portal-inventory';
import {
  createBuildingSchema,
  type CreateBuildingFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { VerifiedStatusField } from '@/features/builder/components/verified-status-field';
import { MediaUploadField } from '@/features/media/components/media-upload-field';
import { toOptionalMediaId } from '@/features/media/schemas/media-fields.schema';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

type AddBuildingFormProps = {
  projectId: string;
  onSuccess?: (() => void) | undefined;
};

/**
 * Form to add a building to a project.
 */
export const AddBuildingForm = ({ projectId, onSuccess }: AddBuildingFormProps) => {
  const scope = useCatalogScope();
  const mediaContext = catalogMediaContext(scope);
  const t = useTranslations('Builder.inventory');
  const mutation = useCreateBuildingMutation(projectId);
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { name: t('buildingName'), coverMediaId: t('coverMedia') },
  });
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBuildingFormValues>({
    resolver: zodResolver(createBuildingSchema),
    defaultValues: { name: '', description: '', coverMediaId: '', verified: false },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        name: values.name,
        ...(values.description.length > 0 ? { description: values.description } : {}),
        ...(toOptionalMediaId(values.coverMediaId) ? { coverMediaId: values.coverMediaId } : {}),
        verified: values.verified,
      });
      reset();
      onSuccess?.();
    } catch {
      showError(t('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <FormField
        id="building-name"
        label={t('buildingName')}
        error={errors.name ? t('validation.name') : undefined}
      >
        <Input id="building-name" {...register('name')} />
      </FormField>
      <FormField id="building-description" label={t('buildingDescription')}>
        <Input id="building-description" {...register('description')} />
      </FormField>
      <Controller
        control={control}
        name="coverMediaId"
        render={({ field, fieldState }) => (
          <MediaUploadField
            id="building-cover-new"
            label={t('coverMedia')}
            context={mediaContext}
            value={field.value}
            onChange={field.onChange}
            error={fieldState.error?.message}
          />
        )}
      />
      <VerifiedStatusField id="building-verified-new" control={control} name="verified" />
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? t('adding') : t('addBuilding')}
      </Button>
      {errorToast}
    </form>
  );
};
