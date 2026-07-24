'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import {
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
} from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import { Select } from '@/shared/ui/select';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';
import type { ViewMode } from '@/shared/ui/view-mode';

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
  /** Floors / apartments hubs: company + building cascading filters. */
  showBuildingFilter?: boolean | undefined;
  headerActions?: ReactNode | undefined;
  viewMode?: ViewMode | undefined;
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
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
  showBuildingFilter = false,
  headerActions,
  viewMode,
  onViewModeChange,
}: AdminInventoryListShellProps) => {
  const t = useTranslations('Admin.projects');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const buildingsQuery = useAdminBuildingsQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE, companyId);

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
      if (byProject !== 0) {
        return byProject;
      }
      return a.name.localeCompare(b.name);
    });
  }, [buildingsQuery.data]);

  const buildListHref = (next: {
    page?: number;
    companyId?: string | null;
    buildingId?: string | null;
  }): string => {
    const params = new URLSearchParams();
    const nextCompanyId = next.companyId === undefined ? companyId : next.companyId || undefined;
    const nextBuildingId =
      next.buildingId === undefined ? buildingId : next.buildingId || undefined;
    const nextPage = next.page ?? page;

    if (nextCompanyId) {
      params.set('companyId', nextCompanyId);
    }
    if (showBuildingFilter && nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }
    if (nextPage > 1) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  const filtersLoading =
    companiesQuery.isLoading || (showBuildingFilter && buildingsQuery.isLoading);

  if (isLoading || filtersLoading) {
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

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <Select
            size="fit"
            className="h-10"
            value={companyId ?? ''}
            aria-label={t('filters.company')}
            onChange={(event) => {
              const nextCompanyId = event.target.value || null;
              router.replace(
                buildListHref({ page: 1, companyId: nextCompanyId, buildingId: null }),
              );
            }}
          >
            <option value="">{t('filters.allCompanies')}</option>
            {builderCompanies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>

          {showBuildingFilter ? (
            <Select
              size="fit"
              className="h-10"
              value={buildingId ?? ''}
              aria-label={t('filters.building')}
              onChange={(event) => {
                const nextBuildingId = event.target.value || null;
                router.replace(buildListHref({ page: 1, buildingId: nextBuildingId }));
              }}
            >
              <option value="">{t('filters.allBuildings')}</option>
              {buildingOptions.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name} · {building.projectName}
                </option>
              ))}
            </Select>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {viewMode && onViewModeChange ? (
            <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
          ) : null}
          {headerActions}
        </div>
      </div>

      {total === 0 ? <p className="text-sm text-ink-secondary">{empty}</p> : children}

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        buildHref={(nextPage) => buildListHref({ page: nextPage })}
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
  buildingId?: string;
} => {
  const searchParams = useSearchParams();
  const companyId = searchParams.get('companyId')?.trim() || undefined;
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: ADMIN_INVENTORY_DEFAULT_PAGE_SIZE,
    ...(companyId ? { companyId } : {}),
    ...(buildingId ? { buildingId } : {}),
  };
};
