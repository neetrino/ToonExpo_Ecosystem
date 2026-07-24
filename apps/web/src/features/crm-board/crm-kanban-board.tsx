'use client';

import type { CrmDealListItem, CrmDealStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useState, type ReactNode } from 'react';

import { CrmKanbanCard } from '@/features/crm-board/crm-kanban-card';
import {
  CRM_KANBAN_COLUMN_ACCENT,
  CRM_KANBAN_DND_MIME,
  CRM_KANBAN_STATUSES,
  type CrmBoardMode,
} from '@/features/crm-board/constants';
import { groupDealsByStatus } from '@/features/crm-board/group-deals-by-status';
import { cn } from '@/shared/ui/cn';

type CrmKanbanBoardProps = {
  deals: CrmDealListItem[];
  mode: CrmBoardMode;
  onOpenDeal: (dealId: string) => void;
  onStatusDrop?: (dealId: string, status: CrmDealStatus) => void | Promise<void>;
  /** Optional quick-create control rendered at top of New column. */
  newColumnAction?: ReactNode;
};

/**
 * Horizontal Kanban board for Constructor CRM deals.
 */
export const CrmKanbanBoard = ({
  deals,
  mode,
  onOpenDeal,
  onStatusDrop,
  newColumnAction,
}: CrmKanbanBoardProps) => {
  const t = useTranslations('CrmBoard');
  const tStatuses = useTranslations('CrmBoard.statuses');
  const tSources = useTranslations('CrmBoard.sources');
  const grouped = groupDealsByStatus(deals);
  const canDrag = mode === 'edit' && Boolean(onStatusDrop);
  const [dragOverStatus, setDragOverStatus] = useState<CrmDealStatus | null>(null);

  return (
    <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4 pt-1">
      {CRM_KANBAN_STATUSES.map((status) => {
        const columnDeals = grouped[status];
        return (
          <section
            key={status}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-sm border border-border bg-surface/50',
              dragOverStatus === status && canDrag ? 'ring-2 ring-brand/30' : undefined,
            )}
            onDragOver={(event) => {
              if (!canDrag) {
                return;
              }
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setDragOverStatus(status);
            }}
            onDragLeave={() => {
              setDragOverStatus((current) => (current === status ? null : current));
            }}
            onDrop={(event) => {
              if (!canDrag || !onStatusDrop) {
                return;
              }
              event.preventDefault();
              setDragOverStatus(null);
              const dealId =
                event.dataTransfer.getData(CRM_KANBAN_DND_MIME) ||
                event.dataTransfer.getData('text/plain');
              if (!dealId) {
                return;
              }
              void onStatusDrop(dealId, status);
            }}
          >
            <header className="border-b border-border px-3 pb-2 pt-3">
              <div
                className={cn('mb-2 h-1 w-full rounded-pill', CRM_KANBAN_COLUMN_ACCENT[status])}
              />
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-semibold text-ink">{tStatuses(status)}</h2>
                <span className="rounded-pill bg-background px-2 py-0.5 text-xs font-medium text-ink-muted">
                  {columnDeals.length}
                </span>
              </div>
            </header>

            <div className="flex max-h-[70vh] flex-1 flex-col gap-2 overflow-y-auto p-2">
              {status === 'new_request' && newColumnAction ? (
                <div className="shrink-0">{newColumnAction}</div>
              ) : null}

              {columnDeals.length === 0 ? (
                <p className="px-1 py-6 text-center text-xs text-ink-muted">{t('emptyColumn')}</p>
              ) : (
                columnDeals.map((deal) => (
                  <CrmKanbanCard
                    key={deal.id}
                    deal={deal}
                    canDrag={canDrag}
                    showCompany={mode === 'readonly'}
                    onOpen={onOpenDeal}
                    sourceLabel={tSources(deal.source)}
                    unnamedLabel={t('unnamedBuyer')}
                    noProjectLabel={t('noProject')}
                  />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
};
