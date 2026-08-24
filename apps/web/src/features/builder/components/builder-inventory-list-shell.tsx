'use client';

import type { LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  PORTAL_DEFAULT_PAGE_SIZE,
  PORTAL_MAX_PAGE_SIZE,
} from '@/features/builder/constants';
import { usePortalInventoryBuildingsQuery } from '@/features/builder/hooks/use-portal-inventory-hub';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePathname, useRouter } from '@/i18n/navigation';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import type { ViewMode } from '@/shared/ui/view-mode';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FILTER_BUILDING_KEY = 'buildingId';
const FIRST_PAGE = 1;

type BuilderInventoryListShellProps = {
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
  search: string;
  onSearchChange: (value: string) => void;
  icon?: LucideIcon | undefined;
  showBuildingFilter?: boolean | undefined;
  headerActions?: ReactNode | undefined;
  viewMode?: ViewMode | undefined;
  onViewModeChange?: ((mode: ViewMode) => void) | undefined;
};

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

/**
 * Shared chrome for builder inventory hubs (buildings / floors / apartments).
 */
export const BuilderInventoryListShell = ({
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
  search,
  onSearchChange,
  icon,
  showBuildingFilter = false,
  headerActions,
  viewMode,
  onViewModeChange,
}: BuilderInventoryListShellProps) => {
  const t = useTranslations('Builder.projects');
  const tFilters = useTranslations('Admin.projects.filters');
  const tCommon = useTranslations('Common.integratedSearch');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  const buildingsQuery = usePortalInventoryBuildingsQuery(1, PORTAL_MAX_PAGE_SIZE);

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

  const buildListHref = (next: { page?: number; buildingId?: string | null }): string => {
    const params = new URLSearchParams();
    const nextBuildingId =
      next.buildingId === undefined ? buildingId : next.buildingId || undefined;
    const nextPage = next.page ?? page;
    if (showBuildingFilter && nextBuildingId) {
      params.set('buildingId', nextBuildingId);
    }
    if (nextPage > FIRST_PAGE) {
      params.set('page', String(nextPage));
    }
    const query = params.toString();
    return query.length > 0 ? `${pathname}?${query}` : pathname;
  };

  const filterConfigs = useMemo((): IntegratedSearchFilterConfig[] => {
    if (!showBuildingFilter) {
      return [];
    }
    return [
      {
        key: FILTER_BUILDING_KEY,
        label: tFilters('building'),
        allOptionLabel: tFilters('allBuildings'),
        searchable: true,
        options: buildingOptions.map((building) => ({
          value: building.id,
          label: `${building.name} · ${building.projectName}`,
        })),
      },
    ];
  }, [buildingOptions, showBuildingFilter, tFilters]);

  if (isLoading || (showBuildingFilter && buildingsQuery.isLoading)) {
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
      <ListPageHeader
        title={title}
        subtitle={subtitle}
        {...(icon ? { icon } : {})}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{ [FILTER_BUILDING_KEY]: buildingId ?? '' }}
        onSearchChange={onSearchChange}
        onFilterChange={(key, value) => {
          if (key === FILTER_BUILDING_KEY) {
            router.replace(buildListHref({ page: FIRST_PAGE, buildingId: value || null }));
          }
        }}
        onClearAll={() => {
          onSearchChange('');
          router.replace(buildListHref({ page: FIRST_PAGE, buildingId: null }));
        }}
        actions={
          <>
            {viewMode && onViewModeChange ? (
              <ViewModeToggle value={viewMode} onChange={onViewModeChange} />
            ) : null}
            {headerActions}
          </>
        }
      />

      {total === 0 ? <p className="text-sm text-ink-secondary">{empty}</p> : children}

      <CatalogPagination
        page={page}
        totalPages={totalPages}
        previousHref={page > FIRST_PAGE ? buildListHref({ page: page - 1 }) : null}
        nextHref={page < totalPages ? buildListHref({ page: page + 1 }) : null}
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />
    </div>
  );
};

export const useBuilderInventoryListParams = (): {
  page: number;
  pageSize: number;
  buildingId?: string;
} => {
  const searchParams = useSearchParams();
  const buildingId = searchParams.get('buildingId')?.trim() || undefined;
  return {
    page: parsePage(searchParams.get('page')),
    pageSize: PORTAL_DEFAULT_PAGE_SIZE,
    ...(buildingId ? { buildingId } : {}),
  };
};
