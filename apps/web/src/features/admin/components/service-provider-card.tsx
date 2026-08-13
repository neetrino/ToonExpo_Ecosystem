'use client';

import type { AdminServiceProviderItem } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import { Briefcase, Building2, SquarePen, Trash2, UserRound, Users } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { IconButton } from '@/shared/ui/icon-button';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const CARD_RADIUS_CLASS = 'rounded-[15px]';
const CARD_MIN_HEIGHT_CLASS = 'min-h-40';

const PROVIDER_TYPE_ICON: Record<AdminServiceProviderItem['providerType'], LucideIcon> = {
  company: Building2,
  person: UserRound,
  team: Users,
  other: Briefcase,
};

type ServiceProviderCardProps = {
  provider: AdminServiceProviderItem;
  busy: boolean;
  onEdit: () => void;
  onDelete: () => void;
};

/**
 * Service provider collection card — same chrome as readiness category cards.
 */
export const ServiceProviderCard = ({
  provider,
  busy,
  onEdit,
  onDelete,
}: ServiceProviderCardProps) => {
  const t = useTranslations('Admin.serviceProviders.providers');
  const TypeIcon = PROVIDER_TYPE_ICON[provider.providerType];
  const categoryNames = provider.categories.map((category) => category.name);

  return (
    <article
      className={cn(
        'flex h-full w-full flex-col gap-5 overflow-hidden border border-border/80',
        CARD_MIN_HEIGHT_CLASS,
        'bg-surface-elevated p-5 shadow-card',
        LIST_CARD_LIFT_CLASS,
        CARD_RADIUS_CLASS,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
          aria-hidden
        >
          <TypeIcon className="size-6" strokeWidth={1.75} />
        </span>
        <div className="flex items-center gap-1">
          <span
            className={cn(
              LIST_STATUS_BADGE_CLASS,
              LIST_STATUS_BADGE_COMPACT_CLASS,
              provider.active ? 'bg-success/10 text-success' : 'bg-surface text-ink-muted',
            )}
          >
            {provider.active ? t('activeYes') : t('activeNo')}
          </span>
          <IconButton
            label={t('edit')}
            size="sm"
            className="text-cta-dark hover:bg-cta-dark/5"
            onClick={onEdit}
          >
            <SquarePen className="size-3.5" strokeWidth={1.75} aria-hidden />
          </IconButton>
          <IconButton
            label={t('delete')}
            size="sm"
            className="text-danger hover:bg-danger-soft"
            disabled={busy}
            onClick={onDelete}
          >
            <Trash2 className="size-3.5" strokeWidth={1.75} aria-hidden />
          </IconButton>
        </div>
      </div>

      <div className="mt-auto flex min-w-0 flex-col gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{provider.name}</h2>
          <p className="text-sm text-ink-secondary">{t(`form.types.${provider.providerType}`)}</p>
        </div>
        {categoryNames.length > 0 ? (
          <p className="line-clamp-2 text-sm leading-5 text-ink-muted">
            {categoryNames.join(' · ')}
          </p>
        ) : null}
      </div>
    </article>
  );
};
