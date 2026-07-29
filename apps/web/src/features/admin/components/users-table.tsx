'use client';

import type { AdminUserListItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { AdminUserCard } from '@/features/admin/components/admin-user-card';
import { UserStatusBadge } from '@/features/admin/components/user-status-badge';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type UsersTableProps = {
  users: AdminUserListItem[];
  viewMode?: ViewMode | undefined;
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
 * Admin users collection as project-style cards or table.
 */
export const UsersTable = ({ users, viewMode = VIEW_MODE_CARDS }: UsersTableProps) => {
  const t = useTranslations('Admin.users');
  const locale = useLocale();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <AdminUserCard key={user.id} user={user} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.email')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.accountType')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.createdAt')}</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5 align-middle font-medium text-ink">{user.name}</td>
              <td className="px-3 py-2.5 align-middle text-ink-secondary">{user.email}</td>
              <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                {t(`accountTypes.${user.accountType}`)}
              </td>
              <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                {user.companyName ?? '—'}
              </td>
              <td className="px-3 py-2.5 align-middle">
                <div className="flex justify-center">
                  <UserStatusBadge status={user.status} />
                </div>
              </td>
              <td className="px-3 py-2.5 align-middle text-center text-ink-secondary">
                {formatDate(user.createdAt, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
