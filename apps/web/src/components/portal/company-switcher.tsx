'use client';

import { useTransition } from 'react';

import { switchActiveCompanyAction } from '@/lib/builder/active-company-actions';
import type { PortalCompanyOption } from '@/lib/builder/company-options';

type CompanySwitcherProps = {
  locale: string;
  activeCompanyId: string;
  companies: PortalCompanyOption[];
  label: string;
  ariaLabel: string;
};

/**
 * Portal company switcher. Hidden by the parent when only one company is available.
 */
export function CompanySwitcher({
  locale,
  activeCompanyId,
  companies,
  label,
  ariaLabel,
}: CompanySwitcherProps) {
  const [pending, startTransition] = useTransition();

  return (
    <label className="portal-company-switcher">
      <span className="portal-company-switcher__label">{label}</span>
      <select
        className="portal-company-switcher__select"
        aria-label={ariaLabel}
        value={activeCompanyId}
        disabled={pending}
        onChange={(event) => {
          const nextId = event.target.value;
          if (nextId === activeCompanyId) {
            return;
          }
          startTransition(() => {
            void switchActiveCompanyAction(locale, nextId);
          });
        }}
      >
        {companies.map((company) => (
          <option key={company.id} value={company.id}>
            {company.name}
          </option>
        ))}
      </select>
    </label>
  );
}
