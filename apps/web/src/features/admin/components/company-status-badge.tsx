'use client';

import type { CompanyStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_CLASS } from '@/shared/ui/list-status-badge';

type CompanyStatusBadgeProps = {
  status: CompanyStatus;
  className?: string | undefined;
};

const statusClassName: Record<CompanyStatus, string> = {
  active: 'bg-success/10 text-success',
  inactive: 'bg-surface text-ink-muted',
  pending: 'bg-warning/10 text-warning',
};

/**
 * Compact pill badge for company active / inactive / pending status.
 */
export const CompanyStatusBadge = ({ status, className }: CompanyStatusBadgeProps) => {
  const t = useTranslations('Admin.companies');

  return (
    <span className={cn(LIST_STATUS_BADGE_CLASS, statusClassName[status], className)}>
      {t(`statuses.${status}`)}
    </span>
  );
};
