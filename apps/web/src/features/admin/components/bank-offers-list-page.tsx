'use client';

import type { BankOfferListItem, PublicationStatus } from '@toonexpo/contracts';
import { Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo, useState } from 'react';

import { BankOffersCollection } from '@/features/admin/components/bank-offers-collection';
import { BankOfferForm } from '@/features/admin/components/bank-offer-form';
import {
  useAdminBankOffersQuery,
  useCreateBankOfferMutation,
  useDeleteBankOfferMutation,
  useUpdateBankOfferMutation,
} from '@/features/admin/hooks/use-admin-bank-offers';
import { useAdminPartnersQuery } from '@/features/admin/hooks/use-admin-partners';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE, ADMIN_VIEW_MODE_KEYS } from '@/features/admin/constants';
import { useAdminCompaniesQuery } from '@/features/admin/hooks/use-admin-companies';
import { PARTNERS_DEFAULT_PAGE_SIZE } from '@/features/partners/constants';
import { usePersistedViewMode } from '@/shared/hooks/use-persisted-view-mode';
import { AdminCreateSheet } from '@/shared/ui/admin-create-sheet';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { AddActionLabel } from '@/shared/ui/add-action-label';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { Select } from '@/shared/ui/select';
import { ViewModeToggle } from '@/shared/ui/view-mode-toggle';

/**
 * Admin bank offers list with filters, create/edit, and publish controls.
 */
export const BankOffersListPage = () => {
  const t = useTranslations('Admin.bankOffers');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [publicationFilter, setPublicationFilter] = useState<PublicationStatus | ''>('');
  const [editing, setEditing] = useState<BankOfferListItem | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<BankOfferListItem | null>(null);
  const { viewMode, setViewMode } = usePersistedViewMode(ADMIN_VIEW_MODE_KEYS.bankOffers);

  const offersQuery = useAdminBankOffersQuery(
    partnerFilter ? { partnerCompanyId: partnerFilter } : {},
  );
  const partnersQuery = useAdminPartnersQuery({
    page: 1,
    pageSize: PARTNERS_DEFAULT_PAGE_SIZE,
    type: 'bank',
  });
  const companiesQuery = useAdminCompaniesQuery(1, ADMIN_COMPANIES_MAX_PAGE_SIZE);

  const createMutation = useCreateBankOfferMutation();
  const updateMutation = useUpdateBankOfferMutation();
  const deleteMutation = useDeleteBankOfferMutation();

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

  const filteredOffers = useMemo(() => {
    const offers = offersQuery.data?.data ?? [];
    if (!publicationFilter) {
      return offers;
    }
    return offers.filter((offer) => offer.publicationStatus === publicationFilter);
  }, [offersQuery.data, publicationFilter]);

  const busy = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  if (offersQuery.isLoading || partnersQuery.isLoading) {
    return <p className="text-sm text-ink-secondary">{t('loading')}</p>;
  }

  if (offersQuery.isError || !offersQuery.data) {
    return (
      <p role="alert" className="text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-page-title text-ink">{t('title')}</h1>
        <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <Select
            size="fit"
            className="h-10"
            value={partnerFilter}
            aria-label={t('filters.allBanks')}
            onChange={(event) => {
              setPartnerFilter(event.target.value);
            }}
          >
            <option value="">{t('filters.allBanks')}</option>
            {bankPartners.map((partner) => (
              <option key={partner.partnerCompanyId} value={partner.partnerCompanyId}>
                {partner.name}
              </option>
            ))}
          </Select>
          <Select
            size="fit"
            className="h-10"
            value={publicationFilter}
            aria-label={t('filters.allPublication')}
            onChange={(event) => {
              setPublicationFilter(event.target.value as PublicationStatus | '');
            }}
          >
            <option value="">{t('filters.allPublication')}</option>
            <option value="draft">{t('filters.draft')}</option>
            <option value="published">{t('filters.published')}</option>
            <option value="archived">{t('filters.archived')}</option>
          </Select>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <ViewModeToggle value={viewMode} onChange={setViewMode} />
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              setCreating(true);
              setEditing(null);
            }}
          >
            <AddActionLabel>{t('newOffer')}</AddActionLabel>
          </Button>
        </div>
      </div>

      <AdminCreateSheet
        open={creating}
        onClose={() => {
          setCreating(false);
        }}
        title={t('createTitle')}
      >
        <BankOfferForm
          key="create"
          bankPartners={bankPartners}
          isBusy={busy}
          onCancel={() => {
            setCreating(false);
          }}
          onCreate={async (body) => {
            await createMutation.mutateAsync(body);
            setCreating(false);
          }}
        />
      </AdminCreateSheet>

      <AdminCreateSheet
        open={editing != null}
        onClose={() => {
          setEditing(null);
        }}
        title={editing ? t('editTitle', { title: editing.title }) : ''}
        headerActions={
          editing ? (
            <IconButton
              label={t('delete')}
              size="sm"
              className="text-danger hover:bg-danger-soft"
              disabled={busy}
              onClick={() => {
                setPendingDelete(editing);
              }}
            >
              <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
            </IconButton>
          ) : undefined
        }
      >
        {editing ? (
          <BankOfferForm
            key={editing.id}
            bankPartners={bankPartners}
            initial={editing}
            isBusy={busy}
            onCancel={() => {
              setEditing(null);
            }}
            onUpdate={async (body) => {
              await updateMutation.mutateAsync({ id: editing.id, body });
              setEditing(null);
            }}
          />
        ) : null}
      </AdminCreateSheet>

      {filteredOffers.length === 0 ? (
        <p className="text-sm text-ink-secondary">{t('empty')}</p>
      ) : (
        <BankOffersCollection
          offers={filteredOffers}
          viewMode={viewMode}
          busy={busy}
          onEdit={(offer) => {
            setEditing(offer);
            setCreating(false);
          }}
          onDelete={(offer) => {
            setPendingDelete(offer);
          }}
        />
      )}

      <AdminDeleteModal
        open={pendingDelete != null}
        title={t('deleteConfirmTitle')}
        message={pendingDelete ? t('deleteConfirmMessage', { title: pendingDelete.title }) : ''}
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
