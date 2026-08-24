'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_PROJECTS_QUERY_KEY,
} from '@/features/admin/constants';
import { useAdminBuilderCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { CatalogScopeProvider } from '@/features/builder/catalog-scope-context';
import { CreateProjectForm } from '@/features/builder/components/create-project-form';
import { useRouter } from '@/i18n/navigation';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { FormField } from '@/shared/ui/form-field';
import { ListboxSelect } from '@/shared/ui/listbox-select';

type AdminCreateProjectSheetProps = {
  open: boolean;
  onClose: () => void;
  defaultCompanyId?: string | undefined;
  /** When set, replaces the default navigate-to-project-detail flow. */
  onCreated?: ((projectId: string) => void) | undefined;
};

/**
 * Admin sheet: pick a builder company, then create a draft project.
 */
export const AdminCreateProjectSheet = ({
  open,
  onClose,
  defaultCompanyId,
  onCreated,
}: AdminCreateProjectSheetProps) => {
  const t = useTranslations('Admin.projects.create');
  const tNew = useTranslations('Builder.projects.new');
  const companiesQuery = useAdminBuilderCompaniesQuery(ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [companyId, setCompanyId] = useState(defaultCompanyId ?? '');

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies.slice().sort((a, b) => a.name.localeCompare(b.name));
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
        <FormField id="create-project-builder" label={t('builder')}>
          <ListboxSelect
            id="create-project-builder"
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
            onChange={setCompanyId}
          />
        </FormField>

        {companyId ? (
          <CatalogScopeProvider key={companyId} scope={{ mode: 'admin', companyId }}>
            <CreateProjectForm
              onCreated={(project) => {
                void queryClient.invalidateQueries({ queryKey: ADMIN_PROJECTS_QUERY_KEY });
                onClose();
                if (onCreated) {
                  onCreated(project.id);
                  return;
                }
                router.push(`/admin/projects/${encodeURIComponent(project.slug)}`);
              }}
            />
          </CatalogScopeProvider>
        ) : (
          <p className="text-sm text-ink-secondary">{t('pickBuilder')}</p>
        )}
      </div>
    </AdminCreateSheet>
  );
};
