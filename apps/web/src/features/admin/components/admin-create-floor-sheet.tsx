'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  useAdminBuildingsQuery,
  useAdminCreateFloorMutation,
} from '@/features/admin/hooks/use-admin-inventory';
import {
  createFloorSchema,
  type CreateFloorFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminCreateFloorSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string | undefined;
  defaultBuildingId?: string | undefined;
};

/**
 * Admin sheet: pick company + building, then create a floor.
 */
export const AdminCreateFloorSheet = ({
  open,
  onClose,
  defaultCompanyId,
  defaultBuildingId,
}: AdminCreateFloorSheetProps) => {
  const t = useTranslations('Admin.floors.create');
  const inventoryT = useTranslations('Builder.inventory');
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const mutation = useAdminCreateFloorMutation();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');
  const [buildingId, setBuildingId] = useState(defaultBuildingId ?? '');
  const [error, setError] = useState<string | null>(null);

  const buildingsQuery = useAdminBuildingsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    companyId || undefined,
  );

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
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
    setError(null);
    reset({
      floorNumber: '1',
      name: '',
      displayLabel: '',
      floorplanMediaId: '',
    });
  }, [open, defaultCompanyId, defaultBuildingId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!companyId || !buildingId) {
      setError(t('pickBuilding'));
      return;
    }
    setError(null);
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
    } catch {
      setError(inventoryT('errors.generic'));
    }
  });

  const busy = isSubmitting || mutation.isPending;

  return (
    <AdminCreateSheet open={open} onClose={onClose} title={t('title')} size="comfortable">
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormField id="create-floor-company" label={t('company')}>
          <Select
            id="create-floor-company"
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
              setBuildingId('');
            }}
          >
            <option value="">{t('selectCompany')}</option>
            {builderCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField id="create-floor-building" label={t('building')}>
          <Select
            id="create-floor-building"
            value={buildingId}
            disabled={!companyId || buildingsQuery.isLoading}
            onChange={(event) => {
              setBuildingId(event.target.value);
            }}
          >
            <option value="">{t('selectBuilding')}</option>
            {buildingOptions.map((building) => (
              <option key={building.id} value={building.id}>
                {building.name} · {building.projectName}
              </option>
            ))}
          </Select>
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

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="sm" variant="secondary" disabled={busy || !buildingId}>
          {busy ? inventoryT('adding') : t('submit')}
        </Button>
      </form>
    </AdminCreateSheet>
  );
};
