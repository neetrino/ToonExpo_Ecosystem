'use client';

import type { CrmDealListItem, RequestSource } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { assigneeInitials } from '@/features/crm-board/assignee-initials';
import { CRM_KANBAN_DND_MIME } from '@/features/crm-board/constants';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { cn } from '@/shared/ui/cn';

const SOURCE_BADGE: Record<RequestSource, string> = {
  buyer_project_request: 'bg-brand/10 text-brand',
  builder_buyer_qr_scan: 'bg-brand-secondary/10 text-brand-secondary',
  manual_builder_entry: 'bg-surface text-ink-secondary',
  event_interaction: 'bg-accent-soft text-ink',
};

type CrmKanbanCardProps = {
  deal: CrmDealListItem;
  canDrag: boolean;
  showCompany: boolean;
  onOpen: (dealId: string) => void;
  sourceLabel: string;
  unnamedLabel: string;
  noProjectLabel: string;
};

/**
 * Compact CRM Kanban card — contact, source, project, assignee, date.
 */
export const CrmKanbanCard = ({
  deal,
  canDrag,
  showCompany,
  onOpen,
  sourceLabel,
  unnamedLabel,
  noProjectLabel,
}: CrmKanbanCardProps) => {
  const locale = useLocale();
  const tBoard = useTranslations('CrmBoard');
  const buyerLabel =
    deal.buyer.name?.trim() || deal.buyer.phone?.trim() || deal.buyer.email?.trim() || unnamedLabel;

  return (
    <article
      draggable={canDrag}
      onDragStart={(event) => {
        if (!canDrag) {
          return;
        }
        event.dataTransfer.setData(CRM_KANBAN_DND_MIME, deal.id);
        event.dataTransfer.setData('text/plain', deal.id);
        event.dataTransfer.effectAllowed = 'move';
      }}
      className={cn(
        'flex flex-col gap-2 rounded-sm border border-border bg-background p-3 shadow-xs',
        'transition-colors hover:border-border-strong hover:bg-surface/40',
        canDrag ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer',
      )}
    >
      <button
        type="button"
        className="flex w-full flex-col gap-2 text-left"
        onClick={() => {
          onOpen(deal.id);
        }}
      >
        <div className="flex items-start justify-between gap-2">
          <span className="min-w-0 truncate text-sm font-semibold text-ink">{buyerLabel}</span>
          <span
            className={cn(
              'shrink-0 rounded-pill px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide',
              SOURCE_BADGE[deal.source],
            )}
          >
            {sourceLabel}
          </span>
        </div>

        {deal.buyer.phone ? (
          <p className="truncate text-xs text-ink-secondary">{deal.buyer.phone}</p>
        ) : null}

        {showCompany && deal.companyName ? (
          <p className="truncate text-xs font-medium text-ink-muted">{deal.companyName}</p>
        ) : null}

        <p className="truncate text-xs text-ink-muted">{deal.projectName ?? noProjectLabel}</p>

        <div className="mt-1 flex items-center justify-between gap-2">
          <span
            className="inline-flex size-6 items-center justify-center rounded-full bg-surface text-[10px] font-semibold text-ink-secondary"
            title={deal.assignedUserName ?? tBoard('unassigned')}
          >
            {assigneeInitials(deal.assignedUserName)}
          </span>
          <time className="text-[10px] text-ink-muted" dateTime={deal.updatedAt}>
            {formatBuyerDateTime(deal.updatedAt, locale)}
          </time>
        </div>
      </button>
    </article>
  );
};
