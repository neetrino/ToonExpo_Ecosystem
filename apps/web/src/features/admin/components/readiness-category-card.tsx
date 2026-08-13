'use client';

import type { ServiceProviderCategoryItem } from '@toonexpo/contracts';
import { Tags } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { resolvePublicAssetUrl } from '@/shared/lib/static-asset-url';
import { cn } from '@/shared/ui/cn';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const CARD_RADIUS_CLASS = 'rounded-[24px]';
const MEDIA_RADIUS_CLASS = 'rounded-[16px]';
const MEDIA_ASPECT_CLASS = 'aspect-[16/10]';
const LOGO_SIZE_PX = 32;

const STATUS_CHIP_TONE = {
  active: 'bg-kpi-green/10 text-kpi-green',
  inactive: 'bg-kpi-orange/10 text-kpi-orange',
} as const;

type ReadinessCategoryCardProps = {
  category: ServiceProviderCategoryItem;
  onEdit: () => void;
};

type CategoryCardHeaderProps = {
  logoUrl: string | null;
  initials: string;
  title: string;
  activeLabel: string;
  isActive: boolean;
};

const CategoryCardHeader = ({
  logoUrl,
  initials,
  title,
  activeLabel,
  isActive,
}: CategoryCardHeaderProps) => (
  <header className="flex flex-col gap-1.5">
    <div className="flex min-w-0 items-center justify-between gap-2">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
        {logoUrl ? (
          <Image src={logoUrl} alt="" fill className="object-cover" sizes={`${LOGO_SIZE_PX}px`} />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-muted">
            {initials}
          </span>
        )}
      </div>
      <span
        className={cn(
          LIST_STATUS_BADGE_CLASS,
          LIST_STATUS_BADGE_COMPACT_CLASS,
          isActive ? STATUS_CHIP_TONE.active : STATUS_CHIP_TONE.inactive,
        )}
      >
        {activeLabel}
      </span>
    </div>
    <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-ink">{title}</h2>
  </header>
);

type CategoryCardCoverProps = {
  mediaUrl: string | null;
  title: string;
};

const CategoryCardCover = ({ mediaUrl, title }: CategoryCardCoverProps) => (
  <div
    className={cn(
      'relative w-full overflow-hidden bg-surface ring-1 ring-border/60',
      MEDIA_ASPECT_CLASS,
      MEDIA_RADIUS_CLASS,
    )}
  >
    {mediaUrl ? (
      <Image
        src={mediaUrl}
        alt=""
        fill
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
      />
    ) : (
      <span className="flex size-full flex-col items-center justify-center gap-1.5 text-ink-muted">
        <Tags className="size-8 opacity-40" aria-hidden />
        <span className="max-w-[80%] truncate text-xs">{title}</span>
      </span>
    )}
  </div>
);

type CategoryCardFooterProps = {
  description: string;
};

const CategoryCardFooter = ({ description }: CategoryCardFooterProps) => {
  if (description.length === 0) {
    return null;
  }

  return <p className="line-clamp-2 text-sm leading-5 text-ink-secondary">{description}</p>;
};

/**
 * Category collection card — same chrome as service provider / company cards.
 */
export const ReadinessCategoryCard = ({ category, onEdit }: ReadinessCategoryCardProps) => {
  const t = useTranslations('Admin.readiness.categories');
  const description = category.description?.trim() ?? '';
  const logoUrl = resolvePublicAssetUrl(category.logoUrl);
  const initials = category.name.trim().slice(0, 2).toUpperCase() || '—';
  const activeLabel = category.active ? t('activeYes') : t('activeNo');

  return (
    <button
      type="button"
      onClick={onEdit}
      className={cn(
        'flex h-full w-full flex-col gap-3 overflow-hidden border border-border/80',
        'bg-surface-elevated p-4 text-left shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <CategoryCardHeader
        logoUrl={logoUrl}
        initials={initials}
        title={category.name}
        activeLabel={activeLabel}
        isActive={category.active}
      />
      <CategoryCardCover mediaUrl={logoUrl} title={category.name} />
      <CategoryCardFooter description={description} />
      <span className="sr-only">{t('edit')}</span>
    </button>
  );
};
