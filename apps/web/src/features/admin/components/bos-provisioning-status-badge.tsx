'use client';

import type { BosProvisioningStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type BosProvisioningStatusBadgeProps = {
  status: BosProvisioningStatus;
};

const STATUS_CLASS: Record<BosProvisioningStatus, string> = {
  success: 'bg-success/10 text-success',
  linked_existing: 'bg-brand/10 text-brand',
  failed: 'bg-danger/10 text-danger',
  partial: 'bg-warning/10 text-warning',
};

/**
 * Status pill for BOS provisioning requests.
 */
export const BosProvisioningStatusBadge = ({ status }: BosProvisioningStatusBadgeProps) => {
  const t = useTranslations('Admin.bos.statuses');

  return (
    <span
      className={cn(
        'inline-flex rounded-pill px-2 py-0.5 text-xs font-medium',
        STATUS_CLASS[status],
      )}
    >
      {t(status)}
    </span>
  );
};
