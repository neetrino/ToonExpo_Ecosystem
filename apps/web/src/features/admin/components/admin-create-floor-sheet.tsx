'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  useAdminBuildingsQuery,
  useAdminCreateFloorMutation,
} from '@/features/admin/hooks/use-admin-inventory';
import {
  createFloorSchema,
  type CreateFloorFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { isFloorNumberDuplicateApiError } from '@/shared/api/errors';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { ListboxSelect } from '@/shared/ui/listbox-select';
import { useFormErrorToast } from '@/shared/ui/use-form-error-toast';

type AdminCreateFloorSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string | undefined;
  defaultBuildingId?: string | undefined;
};

/**
 * Admin sheet: pick builder + building, then create a floor.
 */
export const AdminCreateFloorSheet = ({
  open,
  onClose,
  defaultCompanyId,
  defaultBuildingId,
}: AdminCreateFloorSheetProps) => {
  const t = useTranslations('Admin.floors.create');
  const inventoryT = useTranslations('Builder.inventory');
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const mutation = useAdminCreateFloorMutation();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');
  const [buildingId, setBuildingId] = useState(defaultBuildingId ?? '');
  const { showError, onInvalid, errorToast } = useFormErrorToast({
    fieldLabels: { floorNumber: inventoryT('floorNumber') },
  });

  const buildingsQuery = useAdminBuildingsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    companyId || undefined,
  );

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies.slice().sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const buildingOptions = useMemo(() => {
    const buildings = buildingsQuery.data?.data ?? [];
    return buildings.slice().sort((a, b) => {
      const byProject = a.projectName.localeCompare(b.projectName);
      return byProject !== 0 ? byProject : a.name.localeCompare(b.name);
    });
  }, [buildingsQuery.data]);

  const {
    register,
    handleSubmit,
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

  useEffect(() => {
    if (!open) {
      return;
    }
    setCompanyId(defaultCompanyId ?? '');
    setBuildingId(defaultBuildingId ?? '');
    reset({
      floorNumber: '1',
      name: '',
      displayLabel: '',
      floorplanMediaId: '',
    });
  }, [open, defaultCompanyId, defaultBuildingId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!companyId || !buildingId) {
      showError(t('pickBuilding'));
      return;
    }
    try {
      const floorNumber = Number(values.floorNumber);
      await mutation.mutateAsync({
        companyId,
        buildingId,
        body: {
          floorNumber,
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
    <AdminCreateSheet open={open} onClose={onClose} title={t('title')} size="comfortable">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField id="create-floor-builder" label={t('builder')}>
          <ListboxSelect
            id="create-floor-builder"
            variant="field"
            searchable
            value={companyId}
            options={builderCompanies.map((company) => ({
              value: company.id,
              label: company.name,
            }))}
            placeholder={t('searchBuilder')}
            emptyLabel={t('noBuilderMatches')}
            aria-label={t('builder')}
            onChange={(next) => {
              setCompanyId(next);
              setBuildingId('');
            }}
          />
        </FormField>

        <FormField id="create-floor-building" label={t('building')}>
          <ListboxSelect
            id="create-floor-building"
            variant="field"
            searchable
            value={buildingId}
            disabled={!companyId || buildingsQuery.isLoading}
            options={buildingOptions.map((building) => ({
              value: building.id,
              label: `${building.name} · ${building.projectName}`,
            }))}
            placeholder={t('searchBuilding')}
            emptyLabel={t('noBuildingMatches')}
            aria-label={t('building')}
            onChange={setBuildingId}
          />
        </FormField>

        <div className="grid gap-3 sm:grid-cols-3">
          <FormField
            id="create-floor-number"
            label={inventoryT('floorNumber')}
            error={errors.floorNumber ? inventoryT('validation.floorNumber') : undefined}
          >
            <Input id="create-floor-number" type="number" {...register('floorNumber')} />
          </FormField>

          <FormField id="create-floor-name" label={inventoryT('floorName')}>
            <Input id="create-floor-name" {...register('name')} />
          </FormField>

          <FormField id="create-floor-label" label={inventoryT('displayLabel')}>
            <Input id="create-floor-label" {...register('displayLabel')} />
          </FormField>
        </div>

        <Button type="submit" size="sm" variant="secondary" disabled={busy || !buildingId}>
          {busy ? inventoryT('adding') : t('submit')}
        </Button>
        {errorToast}
      </form>
    </AdminCreateSheet>
  );
};
