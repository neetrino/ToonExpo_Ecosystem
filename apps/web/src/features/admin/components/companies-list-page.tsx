'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

import { CompaniesTable } from '@/features/admin/components/companies-table';
import { CompanyDetailSheet } from '@/features/admin/components/company-detail-sheet';
import { CreateCompanySheet } from '@/features/admin/components/create-company-sheet';
import { ADMIN_COMPANIES_DEFAULT_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { AddActionLabel } from '@/shared/ui/add-action-label';

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
  const [createSheetOpen, setCreateSheetOpen] = useState(false);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

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

  if (query.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (query.isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = query.data;
  if (!response) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-secondary">
            {t('subtitle', { count: response.meta.total })}
          </p>
        </div>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded-pill bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
          onClick={() => {
            setSelectedCompanyId(null);
            setCreateSheetOpen(true);
          }}
        >
          <AddActionLabel>{t('newCompany')}</AddActionLabel>
        </button>
      </div>

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <CompaniesTable companies={response.data} onSelectCompany={handleSelectCompany} />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? '/admin/companies' : `/admin/companies?page=${nextPage}`
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      <CreateCompanySheet open={createSheetOpen} onClose={handleCloseCreateSheet} />
      <CompanyDetailSheet
        companyId={selectedCompanyId}
        open={selectedCompanyId != null}
        onClose={() => setSelectedCompanyId(null)}
      />
    </div>
  );
};
