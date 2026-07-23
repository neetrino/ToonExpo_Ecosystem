'use client';

import type { BankOfferListItem } from '@toonexpo/contracts';
import { SquarePen, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { IconButton } from '@/shared/ui/icon-button';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type BankOffersCollectionProps = {
  offers: BankOfferListItem[];
  viewMode: ViewMode;
  busy: boolean;
  onEdit: (offer: BankOfferListItem) => void;
  onDelete: (offer: BankOfferListItem) => void;
};

/**
 * Bank offers as dense table or card grid.
 */
export const BankOffersCollection = ({
  offers,
  viewMode,
  busy,
  onEdit,
  onDelete,
}: BankOffersCollectionProps) => {
  const t = useTranslations('Admin.bankOffers');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="font-medium text-ink">{offer.title}</span>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  label={t('edit')}
                  size="sm"
                  className="text-cta-dark hover:bg-cta-dark/5"
                  onClick={() => {
                    onEdit(offer);
                  }}
                >
                  <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
                </IconButton>
                <IconButton
                  label={t('delete')}
                  size="sm"
                  className="text-danger hover:bg-danger-soft"
                  disabled={busy}
                  onClick={() => {
                    onDelete(offer);
                  }}
                >
                  <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                </IconButton>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
              <span>{offer.partnerCompanyName ?? '—'}</span>
              <span aria-hidden>·</span>
              <span>{offer.rate}%</span>
            </div>
            <PublicationStatusBadge status={offer.publicationStatus} />
          </div>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">{t('columns.title')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.bank')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.rate')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.publication')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.actions')}</th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id} className="border-t border-border">
              <td className="px-3 py-2.5 text-left font-medium text-ink">{offer.title}</td>
              <td className="px-3 py-2.5 text-center text-ink-secondary">
                {offer.partnerCompanyName ?? '—'}
              </td>
              <td className="px-3 py-2.5 text-center text-ink-secondary">{offer.rate}%</td>
              <td className="px-3 py-2.5">
                <div className="flex justify-center">
                  <PublicationStatusBadge status={offer.publicationStatus} />
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex items-center justify-center gap-1">
                  <IconButton
                    label={t('edit')}
                    size="sm"
                    className="text-cta-dark hover:bg-cta-dark/5"
                    onClick={() => {
                      onEdit(offer);
                    }}
                  >
                    <SquarePen className="size-4" strokeWidth={1.75} aria-hidden />
                  </IconButton>
                  <IconButton
                    label={t('delete')}
                    size="sm"
                    className="text-danger hover:bg-danger-soft"
                    disabled={busy}
                    onClick={() => {
                      onDelete(offer);
                    }}
                  >
                    <Trash2 className="size-4" strokeWidth={1.75} aria-hidden />
                  </IconButton>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
