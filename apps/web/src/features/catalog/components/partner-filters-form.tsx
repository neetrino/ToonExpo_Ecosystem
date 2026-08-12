'use client';

import type { PartnerCompanyType } from '@toonexpo/contracts';
import { useEffect, useMemo, useState } from 'react';

import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';
import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { MultiListboxSelect } from '@/shared/ui/multi-listbox-select';

type PartnerFiltersFormProps = {
  filters: PartnerListFilters;
  availableTypes: PartnerCompanyType[];
  labels: {
    type: string;
    allTypes: string;
    types: Partial<Record<(typeof PARTNER_COMPANY_TYPES)[number], string>>;
    typesSelectedCount: (count: number) => string;
    apply: string;
    reset: string;
  };
};

/**
 * Public partners type filter — multi-select over types that currently have published partners.
 * Empty selection means All types (default).
 */
export const PartnerFiltersForm = ({
  filters,
  availableTypes,
  labels,
}: PartnerFiltersFormProps) => {
  const availableSet = useMemo(() => new Set(availableTypes), [availableTypes]);
  const initialTypes = useMemo(
    () => filters.types.filter((type) => availableSet.has(type)),
    [availableSet, filters.types],
  );
  const typesKey = initialTypes.join(',');
  const [values, setValues] = useState<string[]>(initialTypes);

  useEffect(() => {
    setValues(typesKey.length > 0 ? typesKey.split(',') : []);
  }, [typesKey]);

  const options = useMemo(
    () =>
      PARTNER_COMPANY_TYPES.filter((type) => availableSet.has(type)).map((type) => ({
        value: type,
        label: labels.types[type] ?? type,
      })),
    [availableSet, labels.types],
  );

  const hasActiveFilters = values.length > 0 || filters.page > 1;

  if (options.length === 0) {
    return null;
  }

  return (
    <form method="get" action="/partners" className="flex flex-wrap items-end gap-3">
      <div className="flex min-w-[12rem] flex-col gap-1.5 sm:min-w-[16rem]">
        <span className="text-xs font-medium text-ink-secondary">{labels.type}</span>
        <MultiListboxSelect
          id="partners-filters-type"
          variant="field"
          size="full"
          values={values}
          options={options}
          allLabel={labels.allTypes}
          selectedCountLabel={labels.typesSelectedCount}
          aria-label={labels.type}
          onChange={setValues}
        />
        {values.length > 0 ? <input type="hidden" name="type" value={values.join(',')} /> : null}
      </div>
      <Button type="submit" variant="secondary" size="md" className="h-11">
        {labels.apply}
      </Button>
      {hasActiveFilters ? (
        <Link href="/partners">
          <Button type="button" variant="outline" size="md" className="h-11">
            {labels.reset}
          </Button>
        </Link>
      ) : null}
    </form>
  );
};
