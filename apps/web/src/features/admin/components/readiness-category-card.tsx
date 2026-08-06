'use client';

import type { ReadinessCategoryItem } from '@toonexpo/contracts';
import { Hash, Percent } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardStat,
} from '@/features/admin/components/admin-inventory-card';
import { cn } from '@/shared/ui/cn';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';

type ReadinessCategoryCardProps = {
  category: ReadinessCategoryItem;
  onEdit: () => void;
};

/**
 * Readiness category card — whole card opens edit.
 */
export const ReadinessCategoryCard = ({ category, onEdit }: ReadinessCategoryCardProps) => {
  const t = useTranslations('Admin.readiness.categories');

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(ADMIN_INVENTORY_CARD_CLASS, 'w-full text-left')}
    >
      <div className="flex flex-1 items-start justify-between gap-2 p-4">
        <h2 className="min-w-0 text-base font-semibold tracking-tight text-ink">{category.name}</h2>
        <span
          className={cn(
            LIST_STATUS_BADGE_CLASS,
            LIST_STATUS_BADGE_COMPACT_CLASS,
            category.active ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted',
          )}
        >
          {category.active ? t('activeYes') : t('activeNo')}
        </span>
      </div>

      <div className="mt-auto flex flex-col gap-2.5 border-t border-border px-4 py-3">
        <AdminInventoryCardStat
          icon={<Percent className="size-4" strokeWidth={2} />}
          label={t('columns.weight')}
          value={category.weight ?? '—'}
        />
        <AdminInventoryCardStat
          icon={<Hash className="size-4" strokeWidth={2} />}
          label={t('columns.sort')}
          value={category.sortOrder}
        />
      </div>
    </button>
  );
};
