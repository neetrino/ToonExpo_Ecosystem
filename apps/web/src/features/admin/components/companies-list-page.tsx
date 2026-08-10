'use client';

import { Building2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  buildCompanyReadinessMap,
  CompaniesTable,
} from '@/features/admin/components/companies-table';
import { CompanyDetailSheet } from '@/features/admin/components/company-detail-sheet';
import { CreateCompanySheet } from '@/features/admin/components/create-company-sheet';
import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_VIEW_MODE_KEYS,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminReadinessAssessmentsQuery } from '@/features/admin/hooks/use-admin-readiness';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion';
import { PageTitleBlock } from '@/shared/ui/page-title-icon';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const CONTENT_BASE_DELAY_MS = 80;

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Admin companies list with pagination, create sheet, and company detail sheet.
 */
export const CompaniesListPage = () => {
  const t = useTranslations('Admin.companies');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const page = parsePage(searchParams.get('page'));
  const pageSize = ADMIN_COMPANIES_DEFAULT_PAGE_SIZE;
  const query = useAdminCompaniesQuery(page, pageSize);
  const readinessQuery = useAdminReadinessAssessmentsQuery({
    page: 1,
    pageSize: ADMIN_COMPANIES_MAX_PAGE_SIZE,
    targetType: 'builder_company',
  });
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.companies,
  );

  const readinessByCompanyId = useMemo(
    () => buildCompanyReadinessMap(readinessQuery.data?.data ?? []),
    [readinessQuery.data?.data],
  );

  const clearCreateParam = useCallback((): void => {
    if (searchParams.get('create') !== '1') {
      return;
    }
    const next = new URLSearchParams(searchParams.toString());
    next.delete('create');
    const queryString = next.toString();
    router.replace(queryString.length > 0 ? `${pathname}?${queryString}` : pathname);
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (searchParams.get('create') === '1') {
      setSelectedCompanyId(null);
      setCreateSheetOpen(true);
    }
  }, [searchParams]);

  const handleCloseCreateSheet = (): void => {
    setCreateSheetOpen(false);
    clearCreateParam();
  };

  const handleSelectCompany = (companyId: string): void => {
    setCreateSheetOpen(false);
    clearCreateParam();
    setSelectedCompanyId(companyId);
  };

  const response = query.data;
  const totalCount = response?.meta.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <Reveal force>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PageTitleBlock
            title={t('title')}
            subtitle={
              query.isLoading ? t('loading') : t('subtitle', { count: totalCount })
            }
            icon={Building2}
          />
          <div className="flex flex-wrap items-center gap-2">
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => {
                setSelectedCompanyId(null);
                setCreateSheetOpen(true);
              }}
            >
              <AddActionLabel>{t('newCompany')}</AddActionLabel>
            </Button>
          </div>
        </div>
      </Reveal>

      {query.isLoading ? null : query.isError || !response ? (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      ) : (
        <>
          {response.data.length === 0 ? (
            <Reveal force delayMs={CONTENT_BASE_DELAY_MS}>
              <p className="text-sm text-ink-secondary">{t('empty')}</p>
            </Reveal>
          ) : (
            <CompaniesTable
              companies={response.data}
              readinessByCompanyId={readinessByCompanyId}
              onSelectCompany={handleSelectCompany}
              viewMode={effectiveViewMode}
            />
          )}

          <CatalogPagination
            page={response.meta.page}
            totalPages={response.meta.totalPages}
            buildHref={(nextPage) =>
              nextPage <= 1
                ? '/admin/companies'
                : `/admin/companies?page=${nextPage}`
            }
            previousLabel={t('pagination.previous')}
            nextLabel={t('pagination.next')}
            ariaLabel={t('pagination.ariaLabel')}
          />
        </>
      )}

      <CreateCompanySheet open={createSheetOpen} onClose={handleCloseCreateSheet} />
      <CompanyDetailSheet
        companyId={selectedCompanyId}
        open={selectedCompanyId != null}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
};
