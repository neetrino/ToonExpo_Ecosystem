'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { ADMIN_INVENTORY_CARD_CLASS } from '@/features/admin/components/admin-inventory-card';
import { cn } from '@/shared/ui/cn';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';

type ReadinessCategoryCardProps = {
  category: ServiceProviderCategoryItem;
  onEdit: () => void;
};

/**
 * Service provider category card — whole card opens edit.
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
    </button>
  );
};
