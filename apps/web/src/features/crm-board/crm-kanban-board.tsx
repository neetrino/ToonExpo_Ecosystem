'use client';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import type { CrmDealListItem, CrmDealStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

import { CrmKanbanCard } from '@/features/crm-board/crm-kanban-card';
import { CrmKanbanColumn } from '@/features/crm-board/crm-kanban-column';
import { CrmKanbanScrollArrows } from '@/features/crm-board/crm-kanban-scroll-arrows';
import { CRM_KANBAN_STATUSES, type CrmBoardMode } from '@/features/crm-board/constants';
import { groupDealsByStatus } from '@/features/crm-board/group-deals-by-status';
import { useCrmKanbanHScroll } from '@/features/crm-board/use-crm-kanban-h-scroll';
import { cn } from '@/shared/ui/cn';
import { useDesktopFluidStageScale } from '@/shared/ui/desktop-fluid-stage-scale';

const parseColumnStatus = (id: string | undefined | null): CrmDealStatus | null => {
  if (!id?.startsWith('column:')) {
    return null;
  }
  const status = id.slice('column:'.length) as CrmDealStatus;
  return CRM_KANBAN_STATUSES.includes(status) ? status : null;
};

type CrmKanbanBoardProps = {
  deals: CrmDealListItem[];
  mode: CrmBoardMode;
  onOpenDeal: (dealId: string) => void;
  /** Return `false` to revert an optimistic column move. */
  onStatusDrop?: (dealId: string, status: CrmDealStatus) => boolean | Promise<boolean>;
  newColumnAction?: ReactNode;
};

/**
 * Kanban board — drag overlay portals to `document.body` (stable pointer coords
 * under desktop CSS zoom). Inner card is scaled to match board visual size.
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
  const canDrag = Boolean(onStatusDrop);
  const stageScale = useDesktopFluidStageScale();
  const columnsRef = useRef<HTMLDivElement>(null);
  const { canScrollLeft, canScrollRight, scrollByColumn, startHoverScroll, stopHoverScroll } =
    useCrmKanbanHScroll(columnsRef);
  const [portalReady, setPortalReady] = useState(false);
  const [items, setItems] = useState(deals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<CrmDealStatus | null>(null);

  useEffect(() => {
    setItems(deals);
  }, [deals]);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const grouped = useMemo(() => groupDealsByStatus(items), [items]);
  const activeDeal = activeId ? (items.find((deal) => deal.id === activeId) ?? null) : null;

  const onDragStart = (event: DragStartEvent) => {
    setActiveId(String(event.active.id));
  };

  const onDragOver = (event: DragOverEvent) => {
    const overId = event.over?.id ? String(event.over.id) : null;
    const column =
      parseColumnStatus(overId) ??
      (overId ? (items.find((deal) => deal.id === overId)?.status ?? null) : null);
    setOverColumn(column);
  };

  const onDragEnd = (event: DragEndEvent) => {
    const dealId = String(event.active.id);
    const overId = event.over?.id ? String(event.over.id) : null;
    const targetStatus =
      parseColumnStatus(overId) ??
      (overId ? (items.find((deal) => deal.id === overId)?.status ?? null) : null);

    setActiveId(null);
    setOverColumn(null);

    const original = deals.find((deal) => deal.id === dealId);
    if (!original || !targetStatus || !onStatusDrop || original.status === targetStatus) {
      return;
    }

    setItems((prev) =>
      prev.map((item) => (item.id === dealId ? { ...item, status: targetStatus } : item)),
    );
    void Promise.resolve(onStatusDrop(dealId, targetStatus))
      .then((accepted) => {
        if (accepted === false) {
          setItems(deals);
        }
      })
      .catch(() => {
        setItems(deals);
      });
  };

  const onDragCancel = () => {
    setActiveId(null);
    setOverColumn(null);
  };

  const overlay = (
    <DragOverlay dropAnimation={null} zIndex={1200}>
      {activeDeal ? (
        <div
          className="h-full w-full"
          style={
            stageScale === 1
              ? undefined
              : {
                  // Overlay box is already visual-sized; render design-sized card
                  // then scale up so fonts/padding match the zoomed board.
                  width: `${100 / stageScale}%`,
                  height: `${100 / stageScale}%`,
                  transform: `scale(${stageScale})`,
                  transformOrigin: 'top left',
                }
          }
        >
          <CrmKanbanCard
            deal={activeDeal}
            canDrag={canDrag}
            showCompany={mode === 'readonly'}
            onOpen={onOpenDeal}
            sourceLabel={tSources(activeDeal.source)}
            unnamedLabel={t('unnamedBuyer')}
            noProjectLabel={t('noProject')}
            isDragging
            isOverlay
            className="h-full w-full"
          />
        </div>
      ) : null}
    </DragOverlay>
  );

  return (
    <div className={cn('crm-kanban-board', activeId ? 'crm-kanban-board--dragging' : undefined)}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className="crm-kanban-board-scroller">
          <CrmKanbanScrollArrows
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            onScrollLeft={() => {
              scrollByColumn(-1);
            }}
            onScrollRight={() => {
              scrollByColumn(1);
            }}
            onHoverScrollStart={startHoverScroll}
            onHoverScrollStop={stopHoverScroll}
          />
          <div ref={columnsRef} className="crm-kanban-board-columns luxury-scrollbar">
            {CRM_KANBAN_STATUSES.map((status) => (
              <CrmKanbanColumn
                key={status}
                status={status}
                title={tStatuses(status)}
                deals={grouped[status]}
                isOver={overColumn === status && canDrag}
                canDrag={canDrag}
                showCompany={mode === 'readonly'}
                emptyLabel={t('emptyColumn')}
                unnamedLabel={t('unnamedBuyer')}
                noProjectLabel={t('noProject')}
                sourceLabel={(source) => tSources(source)}
                onOpenDeal={onOpenDeal}
                newColumnAction={status === 'new_request' ? newColumnAction : undefined}
                activeId={activeId}
              />
            ))}
          </div>
        </div>

        {portalReady ? createPortal(overlay, document.body) : overlay}
      </DndContext>
    </div>
  );
};
