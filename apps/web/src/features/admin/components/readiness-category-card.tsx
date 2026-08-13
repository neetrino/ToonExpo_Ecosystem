'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { cn } from '@/shared/ui/cn';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const CARD_MIN_HEIGHT_CLASS = 'min-h-40';

type ReadinessCategoryCardProps = {
  category: ServiceProviderCategoryItem;
  onEdit: () => void;
};

/**
 * Service provider category card — whole card opens edit.
 */
export const ReadinessCategoryCard = ({ category, onEdit }: ReadinessCategoryCardProps) => {
  const t = useTranslations('Admin.readiness.categories');
  const description = category.description?.trim() ?? '';
  const logoUrl = resolvePublicAssetUrl(category.logoUrl);

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'flex h-full w-full flex-col gap-5 overflow-hidden border border-border/80',
        CARD_MIN_HEIGHT_CLASS,
        'bg-surface-elevated p-5 text-left shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <AdminListCardLogo name={category.name} logoUrl={logoUrl} shape="circle" />
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

      <div className="mt-auto flex min-w-0 flex-col gap-1.5">
        <h2 className="text-lg font-semibold tracking-tight text-ink">{category.name}</h2>
        {description.length > 0 ? (
          <p className="line-clamp-2 text-sm leading-5 text-ink-secondary">{description}</p>
        ) : null}
      </div>
    </button>
  );
};
