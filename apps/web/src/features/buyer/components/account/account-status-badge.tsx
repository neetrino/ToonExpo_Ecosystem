import type { BuyerFacingRequestStatus } from '@toonexpo/contracts';

import { Badge, type BadgeProps } from '@/shared/ui/badge';

type AccountStatusBadgeProps = {
  label: string;
  tone?: BadgeProps['tone'];
};

const REQUEST_STATUS_TONE: Record<BuyerFacingRequestStatus, NonNullable<BadgeProps['tone']>> = {
  request_sent: 'info',
  builder_received: 'brand',
  in_contact: 'brand',
  apartment_selected: 'success',
  reserved: 'warning',
  closed: 'neutral',
  cancelled: 'danger',
};

/**
 * Accessible status pill — always pairs color with text label.
 */
export const AccountStatusBadge = ({ label, tone = 'neutral' }: AccountStatusBadgeProps) => {
  return <Badge tone={tone}>{label}</Badge>;
};

/**
 * Maps buyer request status to a badge tone.
 */
export const getRequestStatusTone = (
  status: BuyerFacingRequestStatus,
): NonNullable<BadgeProps['tone']> => REQUEST_STATUS_TONE[status];
