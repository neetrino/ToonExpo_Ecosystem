'use client';

import type { BosProvisioningStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { BOS_PROVISIONING_STATUSES } from '@/features/admin/constants';
import { Select } from '@/shared/ui/select';

type BosProvisioningFiltersProps = {
  status: BosProvisioningStatus | '';
  onChange: (status: BosProvisioningStatus | '') => void;
};

/**
 * Status filter for admin BOS provisioning list.
 */
export const BosProvisioningFilters = ({ status, onChange }: BosProvisioningFiltersProps) => {
  const t = useTranslations('Admin.bos.filters');

  return (
    <Select
      size="fit"
      className="h-10"
      value={status}
      aria-label={t('status')}
      onChange={(event) => {
        onChange(event.target.value as BosProvisioningStatus | '');
      }}
    >
      <option value="">{t('allStatuses')}</option>
      {BOS_PROVISIONING_STATUSES.map((item) => (
        <option key={item} value={item}>
          {t(`statuses.${item}`)}
        </option>
      ))}
    </Select>
  );
};
