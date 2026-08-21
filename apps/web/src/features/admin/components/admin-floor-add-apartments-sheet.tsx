'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { useAdminBulkCreateApartmentsMutation } from '@/features/admin/hooks/use-admin-inventory';
import {
  PLATFORM_INVENTORY_SHEET_SCOPE,
  toCatalogMutationScope,
  type InventorySheetScope,
} from '@/features/admin/inventory-sheet-scope';
import {
  bulkApartmentsSchema,
  type BulkApartmentsFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { buildBulkApartments } from '@/features/builder/utils/project-mappers';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

type AdminFloorAddApartmentsSheetProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  buildingId: string;
  floorId: string;
  floorLabel: string;
  sheetScope?: InventorySheetScope | undefined;
};

const DEFAULT_FORM_VALUES: BulkApartmentsFormValues = {
  count: '4',
  numberPrefix: '',
  startNumber: '1',
  rooms: '',
  bedrooms: '',
  bathrooms: '',
  areaTotal: '',
  price: '',
};

/**
 * Nested create sheet: bulk-add apartments on the current floor.
 */
export const AdminFloorAddApartmentsSheet = ({
  open,
  onClose,
  companyId,
  buildingId,
  floorId,
  floorLabel,
  sheetScope = PLATFORM_INVENTORY_SHEET_SCOPE,
}: AdminFloorAddApartmentsSheetProps) => {
  const t = useTranslations('Admin.apartments.create');
  const inventoryT = useTranslations('Builder.inventory');
  const mutation = useAdminBulkCreateApartmentsMutation();
  const mutationScope = toCatalogMutationScope(sheetScope, companyId);
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { count: inventoryT('count'), startNumber: inventoryT('startNumber') },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BulkApartmentsFormValues>({
    resolver: zodResolver(bulkApartmentsSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    reset(DEFAULT_FORM_VALUES);
  }, [open, reset]);

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        companyId,
        buildingId,
        floorId,
        body: { apartments: buildBulkApartments(values) },
        scope: mutationScope,
      });
      onClose();
    } catch {
      showError(inventoryT('errors.generic'));
    }
  }, onInvalid);

  const busy = isSubmitting || mutation.isPending;

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={t('title')}
      description={floorLabel}
      size="comfortable"
      stackLevel={2}
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            id="floor-add-apt-count"
            label={inventoryT('count')}
            error={errors.count ? inventoryT('validation.count') : undefined}
          >
            <Input id="floor-add-apt-count" type="number" {...register('count')} />
          </FormField>
          <FormField id="floor-add-apt-prefix" label={inventoryT('numberPrefix')}>
            <Input id="floor-add-apt-prefix" {...register('numberPrefix')} />
          </FormField>
          <FormField id="floor-add-apt-start" label={inventoryT('startNumber')}>
            <Input id="floor-add-apt-start" type="number" {...register('startNumber')} />
          </FormField>
          <FormField id="floor-add-apt-rooms" label={inventoryT('rooms')}>
            <Input id="floor-add-apt-rooms" {...register('rooms')} />
          </FormField>
          <FormField id="floor-add-apt-area" label={inventoryT('areaTotal')}>
            <Input id="floor-add-apt-area" {...register('areaTotal')} />
          </FormField>
          <FormField id="floor-add-apt-price" label={inventoryT('price')}>
            <Input id="floor-add-apt-price" {...register('price')} />
          </FormField>
        </div>

        <Button type="submit" size="sm" variant="secondary" disabled={busy}>
          {busy ? inventoryT('adding') : t('submit')}
        </Button>
        {errorToast}
      </form>
    </AdminCreateSheet>
  );
};
