import type { ApartmentSalesStatus } from '@toonexpo/contracts';

import { cn } from '@/shared/ui/cn';
import { LIST_STATUS_BADGE_CLASS } from '@/shared/ui/list-status-badge';

type ApartmentSalesStatusBadgeProps = {
  status: ApartmentSalesStatus;
  label: string;
  className?: string | undefined;
};

const STATUS_CLASS: Record<ApartmentSalesStatus, string> = {
  available: 'bg-success/10 text-success',
  reserved: 'bg-warning/10 text-warning',
  sold: 'bg-surface text-ink-muted',
};

/**
 * Pill badge for apartment sales status (available / reserved / sold).
 */
export const ApartmentSalesStatusBadge = ({
  status,
  label,
  className,
}: ApartmentSalesStatusBadgeProps) => (
  <span className={cn(LIST_STATUS_BADGE_CLASS, STATUS_CLASS[status], className)}>{label}</span>
);
