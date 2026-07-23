'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Select } from '@/shared/ui/select';

type AdminInventoryListShellProps = {
  title: string;
  subtitle: string;
  empty: string;
  loading: string;
  error: string;
  isLoading: boolean;
  isError: boolean;
  total: number;
  page: number;
  totalPages: number;
  children: ReactNode;
};

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
  }
  return Math.floor(parsed);
};

/**
 * Shared chrome for admin inventory hubs (buildings / floors / apartments).
 */
export const AdminInventoryListShell = ({
  title,
  subtitle,
  empty,
  loading,
  error,
  isLoading,
  isError,
  total,
  page,
  totalPages,
  children,
}: AdminInventoryListShellProps) => {
  const t = useTranslations('Admin.projects');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const builderCompanies = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    return companies
      .filter((company) => company.type === 'builder')
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companiesQuery.data]);

  const buildListHref = (nextPage: number, nextCompanyId?: string): string => {
    const params = new URLSearchParams();
    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  if (isLoading || companiesQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{loading}</p>;
  }

  if (isError) {
    return (
      <p role="alert" className="text-sm text-danger">
        {error}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{title}</h1>
        <p className="text-sm text-ink-secondary">{subtitle}</p>
      </div>

      <Select
        size="fit"
        className="h-10"
        value={companyId ?? ''}
        aria-label={t('filters.company')}
        onChange={(event) => {
          const nextCompanyId = event.target.value || undefined;
          router.replace(buildListHref(1, nextCompanyId));
        }}
      >
        <option value="">{t('filters.allCompanies')}</option>
        {builderCompanies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </Select>

      {total === 0 ? <p className="text-sm text-ink-secondary">{empty}</p> : children}

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        buildHref={(nextPage) => buildListHref(nextPage, companyId)}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};

export const useAdminInventoryListParams = (): {
  page: number;
  pageSize: number;
  companyId?: string;
} => {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
  };
};
