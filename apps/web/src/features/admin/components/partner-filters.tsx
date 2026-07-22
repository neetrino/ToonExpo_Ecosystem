'use client';

import type {
  PartnerCompanyStatus,
  PartnerCompanyType,
  PublicationStatus,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import {
  PARTNER_COMPANY_STATUSES,
  PARTNER_COMPANY_TYPES,
  PARTNER_PUBLICATION_STATUSES,
} from '@/features/partners/constants';
import { selectFieldClassName, Select } from '@/shared/ui/select';

type PartnerFiltersProps = {
  type: PartnerCompanyType | '';
  status: PartnerCompanyStatus | '';
  publicationStatus: PublicationStatus | '';
  search: string;
  onChange: (next: {
    type: PartnerCompanyType | '';
    status: PartnerCompanyStatus | '';
    publicationStatus: PublicationStatus | '';
    search: string;
  }) => void;
};

const fieldClassName = 'h-10';

/**
 * Filter row for admin partners list.
 */
export const PartnerFilters = ({
  type,
  status,
  publicationStatus,
  search,
  onChange,
}: PartnerFiltersProps) => {
  const t = useTranslations('Admin.partners.filters');

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex min-w-[10rem] flex-1 flex-col gap-1 text-xs text-ink-muted">
        {t('search')}
        <input
          type="search"
          className={`${selectFieldClassName} h-10`}
          value={search}
          placeholder={t('searchPlaceholder')}
          onChange={(event) => {
            onChange({ type, status, publicationStatus, search: event.target.value });
          }}
        />
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t('type')}
        <Select
          className={fieldClassName}
          value={type}
          aria-label={t('type')}
          onChange={(event) => {
            onChange({
              type: event.target.value as PartnerCompanyType | '',
              status,
              publicationStatus,
              search,
            });
          }}
        >
          <option value="">{t('allTypes')}</option>
          {PARTNER_COMPANY_TYPES.map((item) => (
            <option key={item} value={item}>
              {t(`types.${item}`)}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t('status')}
        <Select
          className={fieldClassName}
          value={status}
          aria-label={t('status')}
          onChange={(event) => {
            onChange({
              type,
              status: event.target.value as PartnerCompanyStatus | '',
              publicationStatus,
              search,
            });
          }}
        >
          <option value="">{t('allStatuses')}</option>
          {PARTNER_COMPANY_STATUSES.map((item) => (
            <option key={item} value={item}>
              {t(`statuses.${item}`)}
            </option>
          ))}
        </Select>
      </label>

      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {t('publication')}
        <Select
          className={fieldClassName}
          value={publicationStatus}
          aria-label={t('publication')}
          onChange={(event) => {
            onChange({
              type,
              status,
              publicationStatus: event.target.value as PublicationStatus | '',
              search,
            });
          }}
        >
          <option value="">{t('allPublication')}</option>
          {PARTNER_PUBLICATION_STATUSES.map((item) => (
            <option key={item} value={item}>
              {t(`publicationStatuses.${item}`)}
            </option>
          ))}
        </Select>
      </label>
    </div>
  );
};
