'use client';

import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from '@toonexpo/contracts';

import { CreatePartnerSheet } from '@/features/admin/components/create-partner-sheet';
import { PartnerDetailSheet } from '@/features/admin/components/partner-detail-sheet';
import { PartnerFilters } from '@/features/admin/components/partner-filters';
import { PartnersTable } from '@/features/admin/components/partners-table';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE, ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminPartnersQuery } from '@/features/admin/hooks/use-admin-partners';
import { PARTNERS_DEFAULT_PAGE_SIZE } from '@/features/partners/constants';
import { CatalogPagination } from '@/features/catalog/components/catalog-pagination';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { Button } from '@/shared/ui/button';
import { AddActionLabel } from '@/shared/ui/add-action-label';
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
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get('page'));
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.partners);
  const [filters, setFilters] = useState<{
    type: PartnerCompanyType | '';
    status: PartnerCompanyStatus | '';
    publicationStatus: PublicationStatus | '';
    search: string;
  }>({ type: '', status: '', publicationStatus: '', search: '' });

  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);
  const partnersQuery = useAdminPartnersQuery({
    page,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.publicationStatus ? { publicationStatus: filters.publicationStatus } : {}),
    ...(filters.search.trim() ? { search: filters.search.trim() } : {}),
  });

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-xl font-semibold text-ink">{t('title')}</h1>
          <p className="text-sm text-ink-secondary">
            {t('subtitle', { count: response.meta.total })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setSelectedPartnerId(null);
              setShowCreate(true);
            }}
          >
            <AddActionLabel>{t('newPartner')}</AddActionLabel>
          </Button>
        </div>
      </div>

      <PartnerFilters
        type={filters.type}
        status={filters.status}
        publicationStatus={filters.publicationStatus}
        search={filters.search}
        onChange={setFilters}
      />

      {response.data.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <PartnersTable
          partners={response.data}
          onSelectPartner={handleSelectPartner}
          viewMode={viewMode}
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
