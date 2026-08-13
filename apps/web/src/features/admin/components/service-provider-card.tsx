'use client';

import type { AdminServiceProviderItem } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Building2, UserRound, Users } from 'lucide-react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
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

const PROVIDER_TYPE_ICON: Record<AdminServiceProviderItem['providerType'], LucideIcon> = {
  company: Building2,
  person: UserRound,
  team: Users,
  other: Briefcase,
};

type ServiceProviderCardProps = {
  provider: AdminServiceProviderItem;
  categoryLogoUrl: string | null;
  onEdit: () => void;
};

type ProviderCardHeaderProps = {
  initials: string;
  typeLabel: string;
  activeLabel: string;
  isActive: boolean;
  title: string;
};

const ProviderCardHeader = ({
  initials,
  typeLabel,
  activeLabel,
  isActive,
  title,
}: ProviderCardHeaderProps) => (
  <header className="flex flex-col gap-1.5">
    <div className="flex min-w-0 items-center gap-2">
      <div className="relative size-8 shrink-0 overflow-hidden rounded-full bg-surface ring-1 ring-border">
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-semibold text-ink-muted">
          {initials}
        </span>
      </div>
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink-secondary">{typeLabel}</p>
      <span
        className={cn(
          LIST_STATUS_BADGE_CLASS,
          LIST_STATUS_BADGE_COMPACT_CLASS,
          isActive ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted',
        )}
      >
        {activeLabel}
      </span>
    </div>
    <h2 className="line-clamp-2 text-base font-semibold tracking-tight text-ink">{title}</h2>
  </header>
);

type ProviderCardCoverProps = {
  mediaUrl: string | null;
  title: string;
  TypeIcon: LucideIcon;
};

const ProviderCardCover = ({ mediaUrl, title, TypeIcon }: ProviderCardCoverProps) => (
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
        <TypeIcon className="size-8 opacity-40" aria-hidden />
        <span className="max-w-[80%] truncate text-xs">{title}</span>
      </span>
    )}
  </div>
);

type ProviderCardFooterProps = {
  categories: AdminServiceProviderItem['categories'];
  publicationStatus: AdminServiceProviderItem['publicationStatus'];
};

const ProviderCardFooter = ({ categories, publicationStatus }: ProviderCardFooterProps) => {
  if (categories.length === 0 && !publicationStatus) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {categories.map((category) => (
        <span
          key={category.id}
          className={cn(
            LIST_STATUS_BADGE_CLASS,
            LIST_STATUS_BADGE_COMPACT_CLASS,
            'bg-surface text-ink-muted',
          )}
        >
          {category.name}
        </span>
      ))}
      {publicationStatus ? <PublicationStatusBadge status={publicationStatus} /> : null}
    </div>
  );
};

/**
 * Service provider collection card — same chrome as partner / company cards.
 */
export const ServiceProviderCard = ({
  provider,
  categoryLogoUrl,
  onEdit,
}: ServiceProviderCardProps) => {
  const t = useTranslations('Admin.serviceProviders.providers');
  const TypeIcon = PROVIDER_TYPE_ICON[provider.providerType];
  const initials = provider.name.trim().slice(0, 2).toUpperCase() || '—';
  const mediaUrl = resolvePublicAssetUrl(categoryLogoUrl);

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
      <ProviderCardHeader
        initials={initials}
        typeLabel={t(`form.types.${provider.providerType}`)}
        activeLabel={provider.active ? t('activeYes') : t('activeNo')}
        isActive={provider.active}
        title={provider.name}
      />
      <ProviderCardCover mediaUrl={mediaUrl} title={provider.name} TypeIcon={TypeIcon} />
      <ProviderCardFooter
        categories={provider.categories}
        publicationStatus={provider.publicationStatus}
      />
      <span className="sr-only">{t('edit')}</span>
    </button>
  );
};
