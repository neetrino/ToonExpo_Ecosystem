'use client';

import type { PartnerType } from '@toonexpo/domain';
import { PARTNER_TYPES } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';

type PublicPartnerTypeFilterProps = {
  currentType?: PartnerType;
  labels: {
    all: string;
    ariaLabel: string;
  } & Record<PartnerType, string>;
};

export function PublicPartnerTypeFilter({ currentType, labels }: PublicPartnerTypeFilterProps) {
  return (
    <nav className="catalog-filter" aria-label={labels.ariaLabel}>
      <FilterLink type={undefined} active={!currentType} label={labels.all} />
      {PARTNER_TYPES.map((type) => (
        <FilterLink key={type} type={type} active={currentType === type} label={labels[type]} />
      ))}
    </nav>
  );
}

type FilterLinkProps = {
  type?: PartnerType;
  active: boolean;
  label: string;
};

function FilterLink({ type, active, label }: FilterLinkProps) {
  const href = type ? `/partners?type=${type}` : '/partners';
  const className = active
    ? 'catalog-filter__link catalog-filter__link--active'
    : 'catalog-filter__link';

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}
