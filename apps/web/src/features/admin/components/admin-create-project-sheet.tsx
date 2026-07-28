'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_PROJECTS_QUERY_KEY,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { CatalogScopeProvider } from '@/features/builder/catalog-scope-context';
import { CreateProjectForm } from '@/features/builder/components/create-project-form';
import { useRouter } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { FormField } from '@/shared/ui/form-field';
import { Select } from '@/shared/ui/select';

type AdminCreateProjectSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string | undefined;
};

/**
 * Admin sheet: pick a builder company, then create a draft project.
 */
export const AdminCreateProjectSheet = ({
  open,
  onClose,
  defaultCompanyId,
}: AdminCreateProjectSheetProps) => {
  const t = useTranslations('Admin.projects.create');
  const tNew = useTranslations('Builder.projects.new');
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  useEffect(() => {
    if (!open) {
      return;
    }
    setCompanyId(defaultCompanyId ?? '');
  }, [open, defaultCompanyId]);

  return (
    <AdminCreateSheet
      open={open}
      onClose={onClose}
      title={t('title')}
      description={tNew('subtitle')}
      size="comfortable"
    >
      <div className="flex flex-col gap-4">
        <FormField id="create-project-company" label={t('company')}>
          <Select
            id="create-project-company"
            value={companyId}
            onChange={(event) => {
              setCompanyId(event.target.value);
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

        {companyId ? (
          <CatalogScopeProvider key={companyId} scope={{ mode: 'admin', companyId }}>
            <CreateProjectForm
              onCreated={(projectId) => {
                void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
                onClose();
                router.push(`/admin/projects/${projectId}`);
              }}
            />
          </CatalogScopeProvider>
        ) : (
          <p className="text-sm text-ink-secondary">{t('pickCompany')}</p>
        )}
      </div>
    </AdminCreateSheet>
  );
};
