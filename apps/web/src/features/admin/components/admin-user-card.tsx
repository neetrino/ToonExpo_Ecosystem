'use client';

import type { AdminUserListItem } from '@toonexpo/contracts';
import { Building2, CalendarDays, Mail, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
} from '@/features/admin/components/admin-inventory-card';
import { UserStatusBadge } from '@/features/admin/components/user-status-badge';
import { cn } from '@/shared/ui/cn';

type AdminUserCardProps = {
  user: AdminUserListItem;
};

const formatDate = (iso: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
};

/**
 * Wide user card for the admin users hub — same chrome as project cards.
 */
export const AdminUserCard = ({ user }: AdminUserCardProps) => {
  const t = useTranslations('Admin.users');
  const locale = useLocale();

  return (
    <article className={cn(ADMIN_INVENTORY_CARD_CLASS, 'active:scale-100')}>
      <div className="flex flex-1 gap-2 p-4">
        <div className="flex min-w-0 flex-1 flex-col">
          <h2 className="text-base font-semibold tracking-tight text-ink">{user.name}</h2>
          <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
            <AdminInventoryCardMetaRow icon={<Mail className="size-3.5" aria-hidden />}>
              {user.email}
            </AdminInventoryCardMetaRow>
            <AdminInventoryCardMetaRow icon={<UserRound className="size-3.5" aria-hidden />}>
              {t(`accountTypes.${user.accountType}`)}
            </AdminInventoryCardMetaRow>
            {user.companyName ? (
              <AdminInventoryCardMetaRow icon={<Building2 className="size-3.5" aria-hidden />}>
                {user.companyName}
              </AdminInventoryCardMetaRow>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          <UserStatusBadge status={user.status} compact />
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand"
            aria-hidden
          >
            <CalendarDays className="size-4" strokeWidth={2} />
          </span>
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[11px] font-medium tracking-wide text-ink-muted uppercase">
              {t('columns.createdAt')}
            </span>
            <span className="text-base font-semibold tabular-nums tracking-tight text-ink">
              {formatDate(user.createdAt, locale)}
            </span>
          </span>
        </span>
      </div>
    </article>
  );
};
