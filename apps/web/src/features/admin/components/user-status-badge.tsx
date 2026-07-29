'use client';

import type { UserStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import {
  LIST_STATUS_BADGE_CLASS,
  LIST_STATUS_BADGE_COMPACT_CLASS,
} from '@/shared/ui/list-status-badge';

type UserStatusBadgeProps = {
  status: UserStatus;
  compact?: boolean | undefined;
  className?: string | undefined;
};

const STATUS_CLASS: Record<UserStatus, string> = {
  active: 'bg-success/10 text-success',
  invited: 'bg-brand/10 text-brand',
  inactive: 'bg-surface text-ink-muted',
  blocked: 'bg-danger/10 text-danger',
};

/**
 * Compact pill badge for user account status.
 */
export const UserStatusBadge = ({ status, compact = false, className }: UserStatusBadgeProps) => {
  const t = useTranslations('Admin.users');

  return (
    <span
      className={cn(
        LIST_STATUS_BADGE_CLASS,
        compact && LIST_STATUS_BADGE_COMPACT_CLASS,
        STATUS_CLASS[status],
        className,
      )}
    >
      {t(`statuses.${status}`)}
    </span>
  );
};
