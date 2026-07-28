import type { BosProvisioningStatus } from '@toonexpo/contracts';

import { BOS_PROVISIONING_STATUSES } from '@/features/admin/constants';
import type { IntegratedSearchFilterConfig } from '@/shared/ui/integrated-search-filters.types';

export const BOS_PROVISIONING_FILTER_STATUS_KEY = 'status';

type BosProvisioningFilterLabels = {
  status: string;
  allStatuses: string;
  statusOption: (status: BosProvisioningStatus) => string;
};

/**
 * Filter configs for admin BOS provisioning integrated search (status).
 */
export const buildBosProvisioningFilterConfigs = (
  labels: BosProvisioningFilterLabels,
): IntegratedSearchFilterConfig[] => [
  {
    key: BOS_PROVISIONING_FILTER_STATUS_KEY,
    label: labels.status,
    allOptionLabel: labels.allStatuses,
    options: BOS_PROVISIONING_STATUSES.map((item) => ({
      value: item,
      label: labels.statusOption(item),
    })),
  },
];
