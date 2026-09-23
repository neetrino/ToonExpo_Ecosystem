'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import type { AdminFloorListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useDuplicateFloorMutation } from '@/features/admin/hooks/use-admin-inventory';
import type { CatalogScope } from '@/features/builder/catalog-scope';
import {
  duplicateFloorSchema,
  type DuplicateFloorFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { isFloorNumberDuplicateApiError } from '@/shared/api/errors';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

export type CopyFloorTarget = Pick<
  AdminFloorListItem,
  'id' | 'number' | 'name' | 'displayLabel' | 'buildingId' | 'builderCompanyId'
>;

export const toCopyFloorTarget = (input: {
  floorId: string;
  floorNumber: number | null;
  floorName: string | null;
  floorDisplayLabel: string | null;
  buildingId: string;
  companyId: string;
}): CopyFloorTarget | null => {
  if (input.floorNumber == null) {
    return null;
  }
  return {
    id: input.floorId,
    number: input.floorNumber,
    name: input.floorName,
    displayLabel: input.floorDisplayLabel,
    buildingId: input.buildingId,
    builderCompanyId: input.companyId,
  };
};

type CopyFloorSheetProps = {
  open: boolean;
  floor: CopyFloorTarget | null;
  onClose: () => void;
  scope?: CatalogScope | undefined;
  stackLevel?: number | undefined;
};

const NEXT_FLOOR_OFFSET = 1;

/**
 * Asks for the new floor number, then copies plan, apartments, and plan hotspots.
 */
export const CopyFloorSheet = ({
  open,
  floor,
  onClose,
  scope,
  stackLevel = 0,
}: CopyFloorSheetProps) => {
  const t = useTranslations('Admin.floors.copy');
  const inventoryT = useTranslations('Builder.inventory');
  const mutation = useDuplicateFloorMutation();
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { floorNumber: inventoryT('floorNumber') },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DuplicateFloorFormValues>({
    resolver: zodResolver(duplicateFloorSchema),
    defaultValues: { floorNumber: '1', name: '', displayLabel: '' },
  });

  useEffect(() => {
    if (!open || !floor) {
      return;
    }
    reset({
      floorNumber: String(floor.number + NEXT_FLOOR_OFFSET),
      name: floor.name ?? '',
      displayLabel: floor.displayLabel ?? '',
    });
  }, [open, floor, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!floor) {
      return;
    }
    try {
      await mutation.mutateAsync({
        companyId: floor.builderCompanyId,
        buildingId: floor.buildingId,
        floorId: floor.id,
        ...(scope ? { scope } : {}),
        body: {
          floorNumber: Number(values.floorNumber),
          ...(values.name.length > 0 ? { name: values.name } : {}),
          ...(values.displayLabel.length > 0 ? { displayLabel: values.displayLabel } : {}),
        },
      });
      onClose();
    } catch (caught) {
      if (isFloorNumberDuplicateApiError(caught)) {
        showError(inventoryT('errors.floorNumberExists', { number: values.floorNumber }));
        return;
      }
      showError(inventoryT('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || mutation.isPending;

  return (
    <AdminCreateSheet
      open={open && floor != null}
      onClose={onClose}
      title={t('title')}
      description={t('hint')}
      size="compact"
      stackLevel={stackLevel}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField
          id="copy-floor-number"
          label={inventoryT('floorNumber')}
          error={errors.floorNumber ? inventoryT('validation.floorNumber') : undefined}
        >
          <Input id="copy-floor-number" type="number" {...register('floorNumber')} />
        </FormField>
        <FormField id="copy-floor-name" label={inventoryT('floorName')}>
          <Input id="copy-floor-name" {...register('name')} />
        </FormField>
        <FormField id="copy-floor-label" label={inventoryT('displayLabel')}>
          <Input id="copy-floor-label" {...register('displayLabel')} />
        </FormField>
        <Button type="submit" size="sm" variant="secondary" disabled={busy || !floor}>
          {busy ? inventoryT('adding') : t('submit')}
        </Button>
        {errorToast}
      </form>
    </AdminCreateSheet>
  );
};
