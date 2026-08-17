'use client';

import type { BankPartnerOfferTemplateItem, PublicationStatus } from '@toonexpo/contracts';
import { FileStack, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { BankPartnerOfferTemplateForm } from '@/features/admin/components/bank-partner-offer-template-form';
import { BankPartnerOfferTemplatesCollection } from '@/features/admin/components/bank-partner-offer-templates-collection';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE, ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import {
  useAdminBankPartnerOfferTemplatesQuery,
  useCreateBankPartnerOfferTemplateMutation,
  useDeleteBankPartnerOfferTemplateMutation,
  useUpdateBankPartnerOfferTemplateMutation,
} from '@/features/admin/hooks/use-admin-bank-partner-offer-templates';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { useAdminPartnersQuery } from '@/features/admin/hooks/use-admin-partners';
import { PARTNERS_DEFAULT_PAGE_SIZE } from '@/features/partners/constants';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';
import { ListPageHeader } from '@/shared/ui/list-page-header';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

const FILTER_PARTNER_KEY = 'partnerFilter';
const FILTER_PUBLICATION_KEY = 'publicationFilter';

/**
 * Admin Templates — bank partner finance offer templates CRUD.
 */
export const BankPartnerOfferTemplatesListPage = () => {
  const t = useTranslations('Admin.templates');
  const tCommon = useTranslations('Common.integratedSearch');
  const [search, setSearch] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [publicationFilter, setPublicationFilter] = useState<PublicationStatus | ''>('');
  const [editing, setEditing] = useState<BankPartnerOfferTemplateItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BankPartnerOfferTemplateItem | null>(null);
  const { viewMode, effectiveViewMode, setViewMode } = usePersistedViewMode(
    ADMIN_VIEW_MODE_KEYS.templates,
  );

  const templatesQuery = useAdminBankPartnerOfferTemplatesQuery(
    partnerFilter ? { partnerCompanyId: partnerFilter } : {},
  );
  const partnersQuery = useAdminPartnersQuery({
    page: 1,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    type: 'bank',
  });
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const createMutation = useCreateBankPartnerOfferTemplateMutation();
  const updateMutation = useUpdateBankPartnerOfferTemplateMutation();
  const deleteMutation = useDeleteBankPartnerOfferTemplateMutation();

  const bankPartners = useMemo(() => {
    const companies = companiesQuery.data?.data ?? [];
    const partners = partnersQuery.data?.data ?? [];
    return partners
      .filter((partner) => partner.type === 'bank')
      .filter((partner) => companies.some((company) => company.id === partner.companyId))
      .map((partner) => ({
        partnerCompanyId: partner.id,
        name: partner.name,
      }));
  }, [companiesQuery.data, partnersQuery.data]);

  const filteredTemplates = useMemo(() => {
    const templates = templatesQuery.data?.data ?? [];
    const bySearch = search.trim()
      ? templates.filter((template) =>
          template.name.toLowerCase().includes(search.trim().toLowerCase()),
        )
      : templates;
    if (!publicationFilter) {
      return bySearch;
    }
    return bySearch.filter((template) => template.publicationStatus === publicationFilter);
  }, [templatesQuery.data, publicationFilter, search]);

  const filterConfigs = useMemo(
    (): IntegratedSearchFilterConfig[] => [
      {
        key: FILTER_PARTNER_KEY,
        label: t('columns.bank'),
        allOptionLabel: t('filters.allBanks'),
        options: bankPartners.map((partner) => ({
          value: partner.partnerCompanyId,
          label: partner.name,
        })),
      },
      {
        key: FILTER_PUBLICATION_KEY,
        label: t('columns.publication'),
        allOptionLabel: t('filters.allPublication'),
        options: [
          { value: 'draft', label: t('filters.draft') },
          { value: 'published', label: t('filters.published') },
          { value: 'archived', label: t('filters.archived') },
        ],
      },
    ],
    [bankPartners, t],
  );

  const busy =
    createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (templatesQuery.isLoading || partnersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (templatesQuery.isError || !templatesQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ListPageHeader
        icon={FileStack}
        title={t('title')}
        subtitle={t('subtitle')}
        search={search}
        searchPlaceholder={tCommon('searchPlaceholder')}
        searchAriaLabel={tCommon('searchLabel')}
        filters={filterConfigs}
        filterValues={{
          [FILTER_PARTNER_KEY]: partnerFilter,
          [FILTER_PUBLICATION_KEY]: publicationFilter,
        }}
        onSearchChange={setSearch}
        onFilterChange={(key, value) => {
          if (key === FILTER_PARTNER_KEY) {
            setPartnerFilter(value);
            return;
          }
          if (key === FILTER_PUBLICATION_KEY) {
            setPublicationFilter(value as PublicationStatus | '');
          }
        }}
        onClearAll={() => {
          setSearch('');
          setPartnerFilter('');
          setPublicationFilter('');
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
                setCreating(true);
                setEditing(null);
              }}
            >
              <AddActionLabel>{t('newTemplate')}</AddActionLabel>
            </Button>
          </>
        }
      />

      <AdminCreateSheet
        open={creating}
        onClose={() => setCreating(false)}
        title={t('createTitle')}
      >
        <BankPartnerOfferTemplateForm
          key="create"
          bankPartners={bankPartners}
          isBusy={busy}
          onCancel={() => setCreating(false)}
          onCreate={async (body) => {
            await createMutation.mutateAsync(body);
            setCreating(false);
          }}
        />
      </AdminCreateSheet>

      <AdminCreateSheet
        open={editing != null}
        onClose={() => setEditing(null)}
        title={editing ? t('editTitle', { title: editing.name }) : ''}
        headerActions={
          editing ? (
            <IconButton
              label={t('delete')}
              size="sm"
              className="text-danger hover:bg-danger-soft"
              disabled={busy}
              onClick={() => setPendingDelete(editing)}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </IconButton>
          ) : undefined
        }
      >
        {editing ? (
          <BankPartnerOfferTemplateForm
            key={editing.id}
            bankPartners={bankPartners}
            initial={editing}
            isBusy={busy}
            onCancel={() => setEditing(null)}
            onUpdate={async (body) => {
              await updateMutation.mutateAsync({ id: editing.id, body });
              setEditing(null);
            }}
          />
        ) : null}
      </AdminCreateSheet>

      {filteredTemplates.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <BankPartnerOfferTemplatesCollection
          templates={filteredTemplates}
          viewMode={effectiveViewMode}
          busy={busy}
          onEdit={(template) => {
            setEditing(template);
            setCreating(false);
          }}
          onDelete={setPendingDelete}
        />
      )}

      <AdminDeleteModal
        open={pendingDelete != null}
        title={t('deleteConfirmTitle')}
        message={
          pendingDelete ? t('deleteConfirmMessage', { title: pendingDelete.name }) : ''
        }
        confirming={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) {
            setPendingDelete(null);
          }
        }}
        onConfirm={() => {
          if (!pendingDelete) {
            return;
          }
          void deleteMutation.mutateAsync(pendingDelete.id).then(() => {
            setPendingDelete(null);
            setEditing(null);
          });
        }}
      />
    </div>
  );
};
