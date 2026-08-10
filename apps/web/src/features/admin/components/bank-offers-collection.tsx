'use client';

import type { BankOfferListItem, PublicationStatus } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  CircleDashed,
  Landmark,
  Percent,
  PiggyBank,
  SquarePen,
  Trash2,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FeaturedBadge, PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { LIST_CARD_LIFT_CLASS, ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type BankOffersCollectionProps = {
  offers: BankOfferListItem[];
  viewMode: ViewMode;
  busy: boolean;
  onEdit: (offer: BankOfferListItem) => void;
  onDelete: (offer: BankOfferListItem) => void;
};

const STATUS_BADGE_CLASS: Record<PublicationStatus, string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
  archived: 'bg-warning-soft text-warning',
};

type BankOfferStatProps = {
  icon: LucideIcon;
  label: string;
  value: string;
};

const BankOfferStat = ({ icon: Icon, label, value }: BankOfferStatProps) => (
  <div className="flex items-center gap-2.5">
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
      aria-hidden
    >
      <Icon className="size-4" strokeWidth={2} />
    </span>
    <span className="text-sm text-ink-secondary">{label}</span>
    <span className="text-lg font-semibold tracking-tight text-ink">{value}</span>
  </div>
);

type BankOfferCardProps = {
  offer: BankOfferListItem;
  onEdit: () => void;
};

/**
 * Bank offer card — same layout family as builder project cards.
 */
const BankOfferCard = ({ offer, onEdit }: BankOfferCardProps) => {
  const t = useTranslations('Admin.bankOffers');
  const StatusIcon = offer.publicationStatus === 'published' ? CheckCircle2 : CircleDashed;
  const bankName = offer.partnerCompanyName?.trim() || '—';

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'flex h-full w-full flex-col overflow-hidden rounded-lg bg-surface-elevated text-left shadow-xs',
        'transition-[box-shadow,transform] duration-[var(--duration-fast)]',
        'hover:shadow-sm',
        LIST_CARD_LIFT_CLASS,
      )}
    >
      <div className="flex flex-1 gap-2 p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-base font-semibold tracking-tight text-ink">{offer.title}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
            <span className="inline-flex min-w-0 items-center gap-1.5">
              <Landmark className="size-3.5 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{bankName}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
              STATUS_BADGE_CLASS[offer.publicationStatus],
            )}
          >
            <StatusIcon className="size-3.5" aria-hidden />
            {t(`form.publicationStatuses.${offer.publicationStatus}`)}
          </span>
          <FeaturedBadge featured={offer.featured} />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <BankOfferStat icon={Percent} label={t('columns.rate')} value={`${offer.rate}%`} />
        <BankOfferStat
          icon={PiggyBank}
          label={t('columns.minDown')}
          value={`${offer.minDownPaymentPercent}%`}
        />
      </div>
    </button>
  );
};

/**
 * Bank offers as dense table or card grid.
 * Card view: whole card opens edit; delete lives in the edit sheet header.
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
      <AdminListCardGrid className="gap-4">
        {offers.map((offer) => (
          <BankOfferCard
            key={offer.id}
            offer={offer}
            onEdit={() => {
              onEdit(offer);
            }}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
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
    </ListTableReveal>
  );
};
