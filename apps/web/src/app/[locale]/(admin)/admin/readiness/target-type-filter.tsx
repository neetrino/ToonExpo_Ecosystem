'use client';

import type { ReadinessTargetType } from '@toonexpo/domain';
import { READINESS_TARGET_TYPES } from '@toonexpo/domain';

import { Link } from '@/i18n/navigation';

type TargetTypeFilterProps = {
  currentType: ReadinessTargetType | undefined;
  labels: {
    all: string;
    ariaLabel: string;
  } & Record<ReadinessTargetType, string>;
};

export function TargetTypeFilter({ currentType, labels }: TargetTypeFilterProps) {
  return (
    <nav className="portal-toolbar" aria-label={labels.ariaLabel}>
      <Link
        className={`portal-btn portal-btn--sm${!currentType ? ' portal-btn--primary' : ' portal-btn--ghost'}`}
        href="/admin/readiness"
      >
        {labels.all}
      </Link>
      {READINESS_TARGET_TYPES.map((type) => (
        <Link
          key={type}
          className={`portal-btn portal-btn--sm${currentType === type ? ' portal-btn--primary' : ' portal-btn--ghost'}`}
          href={`/admin/readiness?target=${type}`}
        >
          {labels[type]}
        </Link>
      ))}
    </nav>
  );
}
