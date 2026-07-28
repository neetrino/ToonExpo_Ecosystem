'use client';

import { useDraggable, useDroppable } from '@dnd-kit/core';
import type { CrmDealListItem, CrmDealStatus } from '@toonexpo/contracts';
import type { ReactNode } from 'react';

import { CrmKanbanCard } from '@/features/crm-board/crm-kanban-card';
import { CRM_KANBAN_COLUMN_ACCENT } from '@/features/crm-board/constants';
import { cn } from '@/shared/ui/cn';

const columnDropId = (status: CrmDealStatus): string => `column:${status}`;

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

export const CrmKanbanColumn = ({
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
      className={cn('crm-kanban-column', highlighted && 'crm-kanban-column--active')}
    >
      <header className="crm-kanban-column__header">
        <div className={cn('crm-kanban-column__accent', CRM_KANBAN_COLUMN_ACCENT[status])} />
        <div className="flex items-center justify-between gap-1.5">
          <h2 className="crm-kanban-column__title">{title}</h2>
          <span className="crm-kanban-column__count">{deals.length}</span>
        </div>
      </header>

      <div className="crm-kanban-column-body luxury-scrollbar">
        {newColumnAction ? (
          <div className="crm-kanban-column__action-slot">{newColumnAction}</div>
        ) : deals.length === 0 ? (
          <div className="crm-kanban-column__action-slot" aria-hidden />
        ) : null}

        {deals.length === 0 ? (
          <div className="crm-kanban-column__empty-wrap">
            <p className="crm-kanban-column__empty">{emptyLabel}</p>
          </div>
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
      className={dragging ? 'opacity-40' : undefined}
      style={{ touchAction: 'none' }}
      {...attributes}
      {...listeners}
    />
  );
};
