'use client';

import {
  DndContext,
  PointerSensor,
  closestCorners,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { CrmDealListItem, CrmDealStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState, type ReactNode } from 'react';

import { CrmKanbanCard } from '@/features/crm-board/crm-kanban-card';
import {
  CRM_KANBAN_COLUMN_ACCENT,
  CRM_KANBAN_STATUSES,
  type CrmBoardMode,
} from '@/features/crm-board/constants';
import { groupDealsByStatus } from '@/features/crm-board/group-deals-by-status';
import { cn } from '@/shared/ui/cn';

const columnDropId = (status: CrmDealStatus): string => `column:${status}`;

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
  onStatusDrop?: (dealId: string, status: CrmDealStatus) => void | Promise<void>;
  newColumnAction?: ReactNode;
};

/**
 * Kanban board — card follows the pointer from the exact grab point.
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
  const [items, setItems] = useState(deals);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [overColumn, setOverColumn] = useState<CrmDealStatus | null>(null);

  useEffect(() => {
    setItems(deals);
  }, [deals]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
  );

  const grouped = useMemo(() => groupDealsByStatus(items), [items]);

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
    void Promise.resolve(onStatusDrop(dealId, targetStatus)).catch(() => {
      setItems(deals);
    });
  };

  const onDragCancel = () => {
    setActiveId(null);
    setOverColumn(null);
  };

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
        <div className="crm-kanban-board-columns">
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
      </DndContext>
    </div>
  );
};

type CrmKanbanColumnProps = {
  status: CrmDealStatus;
  title: string;
  deals: CrmDealListItem[];
  isOver: boolean;
  canDrag: boolean;
  showCompany: boolean;
  emptyLabel: string;
  unnamedLabel: string;
  noProjectLabel: string;
  sourceLabel: (source: CrmDealListItem['source']) => string;
  onOpenDeal: (dealId: string) => void;
  newColumnAction?: ReactNode;
  activeId: string | null;
};

const CrmKanbanColumn = ({
  status,
  title,
  deals,
  isOver,
  canDrag,
  showCompany,
  emptyLabel,
  unnamedLabel,
  noProjectLabel,
  sourceLabel,
  onOpenDeal,
  newColumnAction,
  activeId,
}: CrmKanbanColumnProps) => {
  const { setNodeRef, isOver: isDroppableOver } = useDroppable({
    id: columnDropId(status),
    disabled: !canDrag,
  });
  const highlighted = isOver || isDroppableOver;

  return (
    <section
      ref={setNodeRef}
      className={cn(
        'crm-kanban-column rounded-sm border border-border bg-surface/50',
        'transition-[box-shadow,background-color,border-color] duration-200',
        highlighted ? 'border-brand/40 bg-brand/5 ring-2 ring-brand/25' : undefined,
      )}
    >
      <header className="shrink-0 border-b border-border px-2 pb-1.5 pt-2">
        <div className={cn('mb-1.5 h-0.5 w-full rounded-pill', CRM_KANBAN_COLUMN_ACCENT[status])} />
        <div className="flex items-center justify-between gap-1">
          <h2 className="truncate text-xs font-semibold text-ink">{title}</h2>
          <span className="shrink-0 rounded-pill bg-background px-1.5 py-0.5 text-[10px] font-medium text-ink-muted">
            {deals.length}
          </span>
        </div>
      </header>

      <div className="crm-kanban-column-body">
        {newColumnAction ? <div className="shrink-0">{newColumnAction}</div> : null}

        {deals.length === 0 ? (
          <p className="px-0.5 py-4 text-center text-[10px] text-ink-muted">{emptyLabel}</p>
        ) : (
          deals.map((deal) => (
            <CrmDraggableKanbanCard
              key={deal.id}
              deal={deal}
              canDrag={canDrag}
              showCompany={showCompany}
              onOpen={onOpenDeal}
              sourceLabel={sourceLabel(deal.source)}
              unnamedLabel={unnamedLabel}
              noProjectLabel={noProjectLabel}
              isDragging={activeId === deal.id}
            />
          ))
        )}
      </div>
    </section>
  );
};

type CrmDraggableKanbanCardProps = {
  deal: CrmDealListItem;
  canDrag: boolean;
  showCompany: boolean;
  onOpen: (dealId: string) => void;
  sourceLabel: string;
  unnamedLabel: string;
  noProjectLabel: string;
  isDragging: boolean;
};

const CrmDraggableKanbanCard = ({
  deal,
  canDrag,
  showCompany,
  onOpen,
  sourceLabel,
  unnamedLabel,
  noProjectLabel,
  isDragging,
}: CrmDraggableKanbanCardProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: dndDragging,
  } = useDraggable({
    id: deal.id,
    disabled: !canDrag,
    data: { status: deal.status },
  });

  const dragging = isDragging || dndDragging;

  return (
    <CrmKanbanCard
      ref={setNodeRef}
      deal={deal}
      canDrag={canDrag}
      showCompany={showCompany}
      onOpen={onOpen}
      sourceLabel={sourceLabel}
      unnamedLabel={unnamedLabel}
      noProjectLabel={noProjectLabel}
      isDragging={dragging}
      className={dragging ? 'relative z-50 shadow-lg' : undefined}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
    />
  );
};
