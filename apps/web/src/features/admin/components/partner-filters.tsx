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
import { SearchField } from '@/shared/ui/search-field';
import { Select } from '@/shared/ui/select';
import { cn } from '@/shared/ui/cn';

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
    <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2">
      <SearchField
        className="min-w-[10rem] flex-1"
        value={search}
        placeholder={t('searchPlaceholder')}
        aria-label={t('search')}
        onChange={(event) => {
          onChange({ type, status, publicationStatus, search: event.target.value });
        }}
      />

      <Select
        size="fit"
        className={cn(fieldClassName, 'shrink-0')}
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

      <Select
        size="fit"
        className={cn(fieldClassName, 'shrink-0')}
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

      <Select
        size="fit"
        className={cn(fieldClassName, 'shrink-0')}
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
    </div>
  );
};
