'use client';

import { Handshake } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useMemo, useState } from 'react';

import { CreatePartnerSheet } from '@/features/admin/components/create-partner-sheet';
import {
  applyPartnerListFilterKey,
  buildPartnerFilterConfigs,
  EMPTY_PARTNER_LIST_FILTERS,
  partnerListFiltersToRecord,
} from '@/features/admin/components/partner-filters';
import { PartnerDetailSheet } from '@/features/admin/components/partner-detail-sheet';
import { PartnersTable } from '@/features/admin/components/partners-table';
import { ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminPartnersQuery } from '@/features/admin/hooks/use-admin-partners';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { useRouter } from '@/i18n/navigation';
import { PARTNERS_DEFAULT_PAGE_SIZE } from '@/features/partners/constants';
import { useDebouncedSearch } from '@/shared/hooks/use-debounced-search';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FIRST_PAGE = 1;
const PARTNERS_LIST_PATH = '/admin/partners';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < FIRST_PAGE) {
    return FIRST_PAGE;
  }
  return Math.floor(parsed);
};

/**
 * Admin partners list with filters, pagination, create sheet, and detail sheet.
 */
export const PartnersListPage = () => {
  const t = useTranslations('Admin.partners');
  const tFilters = useTranslations('Admin.partners.filters');
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = parsePage(searchParams.get('page'));
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.partners,
  );
  const [search, setSearch] = useState('');
  const activeSearch = useDebouncedSearch(search);
  const [filters, setFilters] = useState(EMPTY_PARTNER_LIST_FILTERS);

  const partnersQuery = useAdminPartnersQuery({
    page,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.publicationStatus ? { publicationStatus: filters.publicationStatus } : {}),
    ...(activeSearch ? { search: activeSearch } : {}),
  });

  const filterConfigs = useMemo(
    () =>
      buildPartnerFilterConfigs({
        type: tFilters('type'),
        allTypes: tFilters('allTypes'),
        status: tFilters('status'),
        allStatuses: tFilters('allStatuses'),
        publication: tFilters('publication'),
        allPublication: tFilters('allPublication'),
        typeOption: (type) => tFilters(`types.${type}`),
        statusOption: (status) => tFilters(`statuses.${status}`),
        publicationOption: (status) => tFilters(`publicationStatuses.${status}`),
      }),
    [tFilters],
  );

  const handleSelectPartner = (partnerId: string): void => {
    setShowCreate(false);
    setSelectedPartnerId(partnerId);
  };

  const handleSearchChange = (value: string): void => {
    setSearch(value);
    if (page > FIRST_PAGE) {
      router.replace(PARTNERS_LIST_PATH);
    }
  };

  const response = partnersQuery.data;
  const totalCount = response?.meta.total ?? 0;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={Handshake}
        title={t('title')}
        subtitle={partnersQuery.isLoading ? t('loading') : t('subtitle', { count: totalCount })}
        search={search}
        searchPlaceholder={tFilters('searchPlaceholder')}
        searchAriaLabel={tFilters('search')}
        filters={filterConfigs}
        filterValues={partnerListFiltersToRecord(filters)}
        onSearchChange={handleSearchChange}
        onFilterChange={(key, value) => {
          setFilters((prev) => applyPartnerListFilterKey(prev, key, value));
        }}
        onClearAll={() => {
          handleSearchChange('');
          setFilters(EMPTY_PARTNER_LIST_FILTERS);
        }}
        actions={
          <>
            <ViewModeToggle value={viewMode} onChange={setViewMode} />
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="shrink-0"
              onClick={() => {
                setSelectedPartnerId(null);
                setShowCreate(true);
              }}
            >
              <AddActionLabel>{t('newPartner')}</AddActionLabel>
            </Button>
          </>
        }
      />

      {partnersQuery.isLoading ? null : partnersQuery.isError || !response ? (
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      ) : response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <PartnersTable
          partners={response.data}
          onSelectPartner={handleSelectPartner}
          viewMode={effectiveViewMode}
        />
      )}

      {response && !partnersQuery.isLoading ? (
        <CatalogPagination
          page={response.meta.page}
          totalPages={response.meta.totalPages}
          previousHref={
            response.meta.page > FIRST_PAGE
              ? response.meta.page - 1 <= FIRST_PAGE
                ? PARTNERS_LIST_PATH
                : `${PARTNERS_LIST_PATH}?page=${response.meta.page - 1}`
              : null
          }
          nextHref={
            response.meta.page < response.meta.totalPages
              ? `${PARTNERS_LIST_PATH}?page=${response.meta.page + 1}`
              : null
          }
          previousLabel={t('pagination.previous')}
          nextLabel={t('pagination.next')}
          ariaLabel={t('pagination.ariaLabel')}
        />
      ) : null}

      <CreatePartnerSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
        }}
      />
      <PartnerDetailSheet
        partnerId={selectedPartnerId}
        open={selectedPartnerId != null}
        onClose={() => setSelectedPartnerId(null)}
      />
    </div>
  );
};
