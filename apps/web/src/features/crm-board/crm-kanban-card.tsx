'use client';

import type { CrmDealListItem, RequestSource } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';
import { forwardRef, type CSSProperties, type HTMLAttributes } from 'react';

import { assigneeInitials } from '@/features/crm-board/assignee-initials';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { cn } from '@/shared/ui/cn';

const SOURCE_BADGE: Record<RequestSource, string> = {
  buyer_project_request: 'bg-brand/10 text-brand',
  builder_buyer_qr_scan: 'bg-brand-secondary/12 text-brand-secondary',
  manual_builder_entry: 'bg-brand-deep/5 text-brand-deep/80',
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
          'flex flex-col rounded-md border border-border/80 bg-surface-elevated p-2.5 shadow-xs',
          isOverlay
            ? 'border-brand/35 shadow-md ring-1 ring-brand/15'
            : 'hover:-translate-y-px hover:border-brand/25 hover:shadow-sm',
          !isOverlay && !isDragging
            ? 'transition-[transform,box-shadow,border-color,background-color] duration-200 ease-[var(--ease-out-premium)]'
            : undefined,
          canDrag ? 'cursor-grab active:cursor-grabbing touch-none' : 'cursor-pointer',
          isDragging && !isOverlay ? 'pointer-events-none' : undefined,
          className,
        )}
        {...rest}
      >
        <button
          type="button"
          className="flex w-full flex-col gap-1.5 text-left"
          onClick={() => {
            if (isOverlay || isDragging) {
              return;
            }
            onOpen(deal.id);
          }}
        >
          <div className="flex items-start justify-between gap-1.5">
            <span className="min-w-0 truncate text-[13px] font-semibold tracking-tight text-brand-deep">
              {buyerLabel}
            </span>
            <span
              className={cn(
                'max-w-[42%] shrink-0 truncate rounded-pill px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.06em]',
                SOURCE_BADGE[deal.source],
              )}
            >
              {sourceLabel}
            </span>
          </div>

          {deal.buyer.phone ? (
            <p className="truncate text-[11px] text-ink-secondary">{deal.buyer.phone}</p>
          ) : null}

          {showCompany && deal.companyName ? (
            <p className="truncate text-[11px] font-medium text-brand-secondary/90">
              {deal.companyName}
            </p>
          ) : null}

          <p className="truncate text-[11px] text-ink-muted">
            {deal.projectName ?? noProjectLabel}
          </p>

          <div className="mt-0.5 flex items-center justify-between gap-1 border-t border-border/60 pt-1.5">
            <span
              className="inline-flex size-6 items-center justify-center rounded-full bg-brand-soft text-[9px] font-semibold text-brand-deep"
              title={deal.assignedUserName ?? tBoard('unassigned')}
            >
              {assigneeInitials(deal.assignedUserName)}
            </span>
            <time className="truncate text-[10px] text-ink-muted" dateTime={deal.updatedAt}>
              {formatBuyerDateTime(deal.updatedAt, locale)}
            </time>
          </div>
        </button>
      </article>
    );
  },
);

CrmKanbanCard.displayName = 'CrmKanbanCard';
