'use client';

import { useTranslations } from 'next-intl';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useBulkCreateApartmentsMutation } from '@/features/builder/hooks/use-portal-inventory';
import {
  bulkApartmentsSchema,
  type BulkApartmentsFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { buildBulkApartments } from '@/features/builder/utils/project-mappers';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

type BulkApartmentsFormProps = {
  projectId: string;
  floorId: string;
  onSuccess?: (() => void) | undefined;
};

/**
 * Bulk apartment creation form for a floor.
 */
export const BulkApartmentsForm = ({ projectId, floorId, onSuccess }: BulkApartmentsFormProps) => {
  const t = useTranslations('Builder.inventory');
  const mutation = useBulkCreateApartmentsMutation(projectId, floorId);
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { count: t('count'), startNumber: t('startNumber') },
  });
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BulkApartmentsFormValues>({
    resolver: zodResolver(bulkApartmentsSchema),
    defaultValues: {
      count: '4',
      numberPrefix: '',
      startNumber: '1',
      rooms: '',
      bedrooms: '',
      bathrooms: '',
      areaTotal: '',
      price: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({ apartments: buildBulkApartments(values) });
      onSuccess?.();
    } catch {
      showError(t('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || mutation.isPending;

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField
          id={`bulk-count-${floorId}`}
          label={t('count')}
          error={errors.count ? t('validation.count') : undefined}
        >
          <Input id={`bulk-count-${floorId}`} type="number" {...register('count')} />
        </FormField>
        <FormField id={`bulk-prefix-${floorId}`} label={t('numberPrefix')}>
          <Input id={`bulk-prefix-${floorId}`} {...register('numberPrefix')} />
        </FormField>
        <FormField id={`bulk-start-${floorId}`} label={t('startNumber')}>
          <Input id={`bulk-start-${floorId}`} type="number" {...register('startNumber')} />
        </FormField>
        <FormField id={`bulk-rooms-${floorId}`} label={t('rooms')}>
          <Input id={`bulk-rooms-${floorId}`} {...register('rooms')} />
        </FormField>
        <FormField id={`bulk-area-${floorId}`} label={t('areaTotal')}>
          <Input id={`bulk-area-${floorId}`} {...register('areaTotal')} />
        </FormField>
        <FormField id={`bulk-price-${floorId}`} label={t('price')}>
          <Input id={`bulk-price-${floorId}`} {...register('price')} />
        </FormField>
      </div>
      <Button type="submit" variant="secondary" disabled={busy}>
        {busy ? t('adding') : t('createApartments')}
      </Button>
      {errorToast}
    </form>
  );
};
