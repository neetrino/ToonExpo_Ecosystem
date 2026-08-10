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
import { ADMIN_COMPANIES_MAX_PAGE_SIZE, ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminPartnersQuery } from '@/features/admin/hooks/use-admin-partners';
import { PARTNERS_DEFAULT_PAGE_SIZE } from '@/features/partners/constants';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const parsePage = (raw: string | null): number => {
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return 1;
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
  const page = parsePage(searchParams.get('page'));
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.partners,
  );
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_PARTNER_LIST_FILTERS);

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const partnersQuery = useAdminPartnersQuery({
    page,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.publicationStatus ? { publicationStatus: filters.publicationStatus } : {}),
    ...(search.trim() ? { search: search.trim() } : {}),
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

  if (partnersQuery.isLoading || companiesQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (partnersQuery.isError || !partnersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const response = partnersQuery.data;

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={Handshake}
        title={t('title')}
        subtitle={t('subtitle', { count: response.meta.total })}
        search={search}
        searchPlaceholder={tFilters('searchPlaceholder')}
        searchAriaLabel={tFilters('search')}
        filters={filterConfigs}
        filterValues={partnerListFiltersToRecord(filters)}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          setFilters((prev) => applyPartnerListFilterKey(prev, key, value));
        }}
        onClearAll={() => {
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

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <PartnersTable
          partners={response.data}
          onSelectPartner={handleSelectPartner}
          viewMode={effectiveViewMode}
        />
      )}

      <CatalogPagination
        page={response.meta.page}
        totalPages={response.meta.totalPages}
        buildHref={(nextPage) =>
          nextPage <= 1 ? '/admin/partners' : `/admin/partners?page=${nextPage}`
        }
        previousLabel={t('pagination.previous')}
        nextLabel={t('pagination.next')}
        ariaLabel={t('pagination.ariaLabel')}
      />

      <CreatePartnerSheet
        open={showCreate}
        companies={companiesQuery.data?.data ?? []}
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
