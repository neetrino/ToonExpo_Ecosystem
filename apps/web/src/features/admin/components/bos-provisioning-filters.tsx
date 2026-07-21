'use client';

import type { BosProvisioningStatus } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { BOS_PROVISIONING_STATUSES } from '@/features/admin/constants';
import { selectFieldClassName } from '@/shared/ui/select';

type BosProvisioningFiltersProps = {
  status: BosProvisioningStatus | '';
  onChange: (status: BosProvisioningStatus | '') => void;
};

const selectClassName = `${selectFieldClassName} h-10`;

/**
 * Status filter for admin BOS provisioning list.
 */
export const BosProvisioningFilters = ({ status, onChange }: BosProvisioningFiltersProps) => {
  const t = useTranslations('Admin.bos.filters');

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex min-w-[12rem] flex-col gap-1 text-xs text-ink-muted">
        {t('status')}
        <select
          className={selectClassName}
          value={status}
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
        </select>
      </label>
    </div>
  );
};
