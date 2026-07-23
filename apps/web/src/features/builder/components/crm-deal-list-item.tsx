'use client';

import type { CrmDealListItem, CrmDealStatus, RequestSource } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { Link } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';

type CrmDealListItemViewProps = {
  deal: CrmDealListItem;
  variant: 'card' | 'row';
};

const STATUS_BADGE: Record<CrmDealStatus, string> = {
  new_request: 'bg-brand/10 text-brand',
  assigned: 'bg-surface text-ink-secondary',
  contacted: 'bg-surface text-ink',
  follow_up_needed: 'bg-danger-soft text-danger',
  apartment_selected: 'bg-brand/10 text-brand',
  reserved: 'bg-brand/15 text-brand',
  converted: 'bg-surface text-ink',
  closed: 'bg-surface text-ink-muted',
  lost: 'bg-danger-soft text-danger',
};

const SOURCE_ICON: Record<RequestSource, string> = {
  buyer_project_request: '◎',
  builder_buyer_qr_scan: '▣',
  manual_builder_entry: '✎',
  event_interaction: '✧',
};

/**
 * Compact deal card (mobile) or table row (desktop).
 */
export const CrmDealListItemView = ({ deal, variant }: CrmDealListItemViewProps) => {
  const t = useTranslations('Builder.crm');
  const locale = useLocale();
  const buyerLabel =
    deal.buyer.name?.trim() ||
    deal.buyer.phone?.trim() ||
    deal.buyer.email?.trim() ||
    t('unnamedBuyer');
  const href = `/builder/crm/deals/${deal.id}` as const;
  const statusBadge = (
    <span
      className={cn(
        LIST_STATUS_BADGE_CLASS,
        STATUS_BADGE[deal.status],
        variant === 'card' ? LIST_STATUS_BADGE_COMPACT_CLASS : undefined,
      )}
    >
      {t(`statuses.${deal.status}`)}
    </span>
  );

  if (variant === 'card') {
    return (
      <Link
        href={href}
        className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3 transition-colors hover:bg-surface/60"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="min-w-0 truncate font-medium text-ink">{buyerLabel}</span>
          {statusBadge}
        </div>
        <p className="text-sm text-ink-secondary">{deal.projectName ?? t('noProject')}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          <span title={t(`sources.${deal.source}`)}>
            <span aria-hidden="true">{SOURCE_ICON[deal.source]}</span> {t(`sources.${deal.source}`)}
          </span>
          <span aria-hidden>·</span>
          <span>{deal.assignedUserName ?? t('unassigned')}</span>
          <span aria-hidden>·</span>
          <span>{formatBuyerDateTime(deal.updatedAt, locale)}</span>
        </div>
      </Link>
    );
  }

  return (
    <tr className="border-t border-border hover:bg-surface/60">
      <td className="px-3 py-2.5 align-middle">
        <Link href={href} className="font-medium text-brand hover:underline">
          {buyerLabel}
        </Link>
      </td>
      <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
        {deal.projectName ?? t('noProject')}
      </td>
      <td className="px-3 py-2.5 align-middle">
        <div className="flex justify-center">{statusBadge}</div>
      </td>
      <td
        className="px-3 py-2.5 align-middle text-center text-ink-secondary"
        title={t(`sources.${deal.source}`)}
      >
        <span aria-hidden="true">{SOURCE_ICON[deal.source]}</span>
        <span className="sr-only">{t(`sources.${deal.source}`)}</span>
      </td>
      <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
        {deal.assignedUserName ?? t('unassigned')}
      </td>
      <td className="px-3 py-2.5 align-middle text-center text-xs text-ink-muted">
        {formatBuyerDateTime(deal.updatedAt, locale)}
      </td>
    </tr>
  );
};
