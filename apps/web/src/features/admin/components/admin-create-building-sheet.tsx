'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import {
  useAdminCompaniesQuery,
  useAdminCompanyProjectsQuery,
} from '@/features/admin/hooks/use-admin-companies';
import { useAdminCreateBuildingMutation } from '@/features/admin/hooks/use-admin-inventory';
import {
  createBuildingSchema,
  type CreateBuildingFormValues,
} from '@/features/builder/schemas/inventory.schema';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { Button } from '@/shared/ui/button';
import { FormField } from '@/shared/ui/form-field';
import { Input } from '@/shared/ui/input';
import { Select } from '@/shared/ui/select';

type AdminCreateBuildingSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string | undefined;
};

/**
 * Admin sheet: pick company + project, then create a building.
 */
export const AdminCreateBuildingSheet = ({
  open,
  onClose,
  defaultCompanyId,
}: AdminCreateBuildingSheetProps) => {
  const t = useTranslations('Admin.buildings.create');
  const inventoryT = useTranslations('Builder.inventory');
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const mutation = useAdminCreateBuildingMutation();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');
  const [projectId, setProjectId] = useState('');
  const [error, setError] = useState<string | null>(null);

  const projectsQuery = useAdminCompanyProjectsQuery(companyId, open && companyId.length > 0);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateBuildingFormValues>({
    resolver: zodResolver(createBuildingSchema),
    defaultValues: { name: '', description: '', coverMediaId: '' },
  });

  useEffect(() => {
    if (!open) {
      return;
    }
    setCompanyId(defaultCompanyId ?? '');
    setProjectId('');
    setError(null);
    reset({ name: '', description: '', coverMediaId: '' });
  }, [open, defaultCompanyId, reset]);

  const onSubmit = handleSubmit(async (values) => {
    if (!companyId || !projectId) {
      setError(t('pickProject'));
      return;
    }
    setError(null);
    try {
      await mutation.mutateAsync({
        companyId,
        projectId,
        body: {
          name: values.name,
          ...(values.description.length > 0 ? { description: values.description } : {}),
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
        <FormField id="create-building-company" label={t('company')}>
          <Select
            id="create-building-company"
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
              setProjectId('');
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

        <FormField id="create-building-project" label={t('project')}>
          <Select
            id="create-building-project"
            value={projectId}
            disabled={!companyId || projectsQuery.isLoading}
            onChange={(event) => {
              setProjectId(event.target.value);
            }}
          >
            <option value="">{t('selectProject')}</option>
            {(projectsQuery.data?.data ?? []).map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField
          id="create-building-name"
          label={inventoryT('buildingName')}
          error={errors.name ? inventoryT('validation.name') : undefined}
        >
          <Input id="create-building-name" {...register('name')} />
        </FormField>

        <FormField id="create-building-description" label={inventoryT('buildingDescription')}>
          <Input id="create-building-description" {...register('description')} />
        </FormField>

        {error ? (
          <p role="alert" className="text-sm text-danger">
            {error}
          </p>
        ) : null}

        <Button type="submit" size="sm" variant="secondary" disabled={busy || !projectId}>
          {busy ? inventoryT('adding') : t('submit')}
        </Button>
      </form>
    </AdminCreateSheet>
  );
};
