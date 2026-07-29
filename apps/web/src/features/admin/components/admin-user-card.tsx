'use client';

import type { AdminUserListItem } from '@toonexpo/contracts';
import { Building2, CalendarDays, Mail, UserRound } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryCardStat,
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
      month: 'short',
      day: 'numeric',
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
        <AdminInventoryCardStat
          icon={<CalendarDays className="size-4" strokeWidth={2} />}
          label={t('columns.createdAt')}
          value={
            <span className="text-sm font-semibold tracking-tight">
              {formatDate(user.createdAt, locale)}
            </span>
          }
        />
      </div>
    </article>
  );
};
