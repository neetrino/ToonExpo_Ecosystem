'use client';

import type { CrmDealListItem, RequestSource } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

import { assigneeInitials } from '@/features/crm-board/assignee-initials';
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
  isDragging?: boolean;
  isOverlay?: boolean;
  style?: CSSProperties;
} & Omit<HTMLAttributes<HTMLElement>, 'onClick'>;

/**
 * Compact CRM Kanban card — contact, source, project, assignee, date.
 */
export const CrmKanbanCard = forwardRef<HTMLElement, CrmKanbanCardProps>(
  (
    {
      deal,
      canDrag,
      showCompany,
      onOpen,
      sourceLabel,
      unnamedLabel,
      noProjectLabel,
      isDragging = false,
      isOverlay = false,
      style,
      className,
      ...rest
    },
    ref,
  ) => {
    const locale = useLocale();
    const tBoard = useTranslations('CrmBoard');
    const buyerLabel =
      deal.buyer.name?.trim() ||
      deal.buyer.phone?.trim() ||
      deal.buyer.email?.trim() ||
      unnamedLabel;

    return (
      <article
        ref={ref}
        style={style}
        className={cn(
          'flex flex-col gap-1.5 rounded-sm border border-border bg-background p-2 shadow-xs',
          'transition-[box-shadow,transform,opacity,border-color] duration-200 ease-out',
          canDrag ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-pointer',
          isDragging && !isOverlay ? 'opacity-40 scale-[0.98]' : undefined,
          isOverlay
            ? 'rotate-2 scale-105 border-brand/40 shadow-lg ring-2 ring-brand/20'
            : 'hover:border-border-strong hover:bg-surface/40',
          className,
        )}
        {...rest}
      >
        <button
          type="button"
          className="flex w-full flex-col gap-1 text-left"
          onClick={() => {
            if (isOverlay || isDragging) {
              return;
            }
            onOpen(deal.id);
          }}
        >
          <div className="flex items-start justify-between gap-1">
            <span className="min-w-0 truncate text-xs font-semibold text-ink">{buyerLabel}</span>
            <span
              className={cn(
                'max-w-[45%] shrink-0 truncate rounded-pill px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide',
                SOURCE_BADGE[deal.source],
              )}
            >
              {sourceLabel}
            </span>
          </div>

          {deal.buyer.phone ? (
            <p className="truncate text-[10px] text-ink-secondary">{deal.buyer.phone}</p>
          ) : null}

          {showCompany && deal.companyName ? (
            <p className="truncate text-[10px] font-medium text-ink-muted">{deal.companyName}</p>
          ) : null}

          <p className="truncate text-[10px] text-ink-muted">
            {deal.projectName ?? noProjectLabel}
          </p>

          <div className="mt-0.5 flex items-center justify-between gap-1">
            <span
              className="inline-flex size-5 items-center justify-center rounded-full bg-surface text-[9px] font-semibold text-ink-secondary"
              title={deal.assignedUserName ?? tBoard('unassigned')}
            >
              {assigneeInitials(deal.assignedUserName)}
            </span>
            <time className="truncate text-[9px] text-ink-muted" dateTime={deal.updatedAt}>
              {formatBuyerDateTime(deal.updatedAt, locale)}
            </time>
          </div>
        </button>
      </article>
    );
  },
);

CrmKanbanCard.displayName = 'CrmKanbanCard';
