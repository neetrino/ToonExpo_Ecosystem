'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import {
  useAdminBuildingFloorsQuery,
  useAdminBuildingsQuery,
  useAdminBulkCreateApartmentsMutation,
} from '@/features/admin/hooks/use-admin-inventory';
import {
  bulkApartmentsSchema,
  type BulkApartmentsFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { buildBulkApartments } from '@/features/builder/utils/project-mappers';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminCreateApartmentSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string | undefined;
  defaultBuildingId?: string | undefined;
};

/**
 * Admin sheet: pick company → building → floor, then bulk-create apartments.
 */
export const AdminCreateApartmentSheet = ({
  open,
  onClose,
  defaultCompanyId,
  defaultBuildingId,
}: AdminCreateApartmentSheetProps) => {
  const t = useTranslations('Admin.apartments.create');
  const inventoryT = useTranslations('Builder.inventory');
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const mutation = useAdminBulkCreateApartmentsMutation();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');
  const [buildingId, setBuildingId] = useState(defaultBuildingId ?? '');
  const [floorId, setFloorId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const buildingsQuery = useAdminBuildingsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    companyId || undefined,
  );
  const floorsQuery = useAdminBuildingFloorsQuery(companyId, buildingId);

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

  useEffect(() => {
    if (!open) {
      return;
    }
    setCompanyId(defaultCompanyId ?? '');
    setBuildingId(defaultBuildingId ?? '');
    setFloorId('');
    setError(null);
    reset({
      count: '4',
      numberPrefix: '',
      startNumber: '1',
      rooms: '',
      bedrooms: '',
      bathrooms: '',
      areaTotal: '',
      price: '',
    });
  }, [open, defaultCompanyId, defaultBuildingId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!companyId || !floorId) {
      setError(t('pickFloor'));
      return;
    }
    setError(null);
    try {
      await mutation.mutateAsync({
        companyId,
        floorId,
        body: { apartments: buildBulkApartments(values) },
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
        <FormField id="create-apt-company" label={t('company')}>
          <Select
            id="create-apt-company"
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
              setBuildingId('');
              setFloorId('');
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

        <FormField id="create-apt-building" label={t('building')}>
          <Select
            id="create-apt-building"
            value={buildingId}
            disabled={!companyId || buildingsQuery.isLoading}
            onChange={(event) => {
              setBuildingId(event.target.value);
              setFloorId('');
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

        <FormField id="create-apt-floor" label={t('floor')}>
          <Select
            id="create-apt-floor"
            value={floorId}
            disabled={!buildingId || floorsQuery.isLoading}
            onChange={(event) => {
              setFloorId(event.target.value);
            }}
          >
            <option value="">{t('selectFloor')}</option>
            {(floorsQuery.data ?? []).map((floor) => {
              const label =
                floor.displayLabel?.trim() ||
                floor.name?.trim() ||
                inventoryT('floorLabel', { number: floor.number });
              return (
                <option key={floor.id} value={floor.id}>
                  {label}
                </option>
              );
            })}
          </Select>
        </FormField>

        <div className="grid gap-3 sm:grid-cols-2">
          <FormField
            id="create-apt-count"
            label={inventoryT('count')}
            error={errors.count ? inventoryT('validation.count') : undefined}
          >
            <Input id="create-apt-count" type="number" {...register('count')} />
          </FormField>
          <FormField id="create-apt-prefix" label={inventoryT('numberPrefix')}>
            <Input id="create-apt-prefix" {...register('numberPrefix')} />
          </FormField>
          <FormField id="create-apt-start" label={inventoryT('startNumber')}>
            <Input id="create-apt-start" type="number" {...register('startNumber')} />
          </FormField>
          <FormField id="create-apt-rooms" label={inventoryT('rooms')}>
            <Input id="create-apt-rooms" {...register('rooms')} />
          </FormField>
          <FormField id="create-apt-area" label={inventoryT('areaTotal')}>
            <Input id="create-apt-area" {...register('areaTotal')} />
          </FormField>
          <FormField id="create-apt-price" label={inventoryT('price')}>
            <Input id="create-apt-price" {...register('price')} />
          </FormField>
        </div>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="sm" variant="secondary" disabled={busy || !floorId}>
          {busy ? inventoryT('adding') : t('submit')}
        </Button>
      </form>
    </AdminCreateSheet>
  );
};
