'use client';

import type { PublicationStatus } from '@toonexpo/contracts';
import { CheckCircle2, CircleDashed } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { ReactNode } from 'react';

import { toCatalogPublicationStatus } from '@/features/catalog/utils/catalog-publication-status';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const STATUS_BADGE_CLASS: Record<'published' | 'draft', string> = {
  published: 'bg-success-soft text-success',
  draft: 'bg-surface text-ink-muted',
};

export const ADMIN_INVENTORY_CARD_CLASS = cn(
  'flex h-full flex-col overflow-hidden rounded-lg bg-surface-elevated shadow-xs',
  LIST_CARD_LIFT_CLASS,
);

type AdminInventoryPublicationBadgeProps = {
  status: PublicationStatus;
};

/**
 * Publication pill matching admin project cards.
 */
export const AdminInventoryPublicationBadge = ({ status }: AdminInventoryPublicationBadgeProps) => {
  const t = useTranslations('Admin.projects');
  const catalogStatus = toCatalogPublicationStatus(status);
  const StatusIcon = catalogStatus === 'published' ? CheckCircle2 : CircleDashed;

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-pill px-2.5 py-1 text-xs font-medium',
        STATUS_BADGE_CLASS[catalogStatus],
      )}
    >
      <StatusIcon className="size-3.5" aria-hidden />
      {t(`publication.${catalogStatus}`)}
    </span>
  );
};

type AdminInventoryCardStatProps = {
  icon: ReactNode;
  label: string;
  value: ReactNode;
};

/**
 * Footer stat chip — same layout as project buildings/apartments counts.
 */
export const AdminInventoryCardStat = ({ icon, label, value }: AdminInventoryCardStatProps) => (
  <div className="flex items-center gap-2.5">
    <span
      className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
      aria-hidden
    >
      {icon}
    </span>
    <span className="text-sm text-ink-secondary">{label}</span>
    <span className="text-lg font-semibold tracking-tight text-ink">{value}</span>
  </div>
);

type AdminInventoryCardMetaRowProps = {
  icon: ReactNode;
  children: ReactNode;
};

/**
 * Secondary meta line with leading icon.
 */
export const AdminInventoryCardMetaRow = ({ icon, children }: AdminInventoryCardMetaRowProps) => (
  <span className="inline-flex min-w-0 items-center gap-1.5">
    <span className="shrink-0 opacity-70" aria-hidden>
      {icon}
    </span>
    <span className="truncate">{children}</span>
  </span>
);
