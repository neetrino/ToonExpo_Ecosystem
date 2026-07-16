'use client';

import type { PublicationStatus } from '@toonexpo/domain';
import { PUBLICATION_STATUSES } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';

type ProjectStatusFilterProps = {
  currentStatus?: PublicationStatus;
  labels: {
    all: string;
    ariaLabel: string;
    DRAFT: string;
    PUBLISHED: string;
    ARCHIVED: string;
  };
};

export function ProjectStatusFilter({ currentStatus, labels }: ProjectStatusFilterProps) {
  return (
    <nav className="portal-filter" aria-label={labels.ariaLabel}>
      <FilterLink status={undefined} active={!currentStatus} label={labels.all} />
      {PUBLICATION_STATUSES.map((status) => (
        <FilterLink
          key={status}
          status={status}
          active={currentStatus === status}
          label={labels[status]}
        />
      ))}
    </nav>
  );
}

type FilterLinkProps = {
  status?: PublicationStatus;
  active: boolean;
  label: string;
};

function FilterLink({ status, active, label }: FilterLinkProps) {
  const href = status ? `/admin/projects?status=${status}` : '/admin/projects';
  const className = active
    ? 'portal-filter__link portal-filter__link--active'
    : 'portal-filter__link';

  return (
    <Link className={className} href={href}>
      {label}
    </Link>
  );
}
