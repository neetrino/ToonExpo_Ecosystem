import type { PartnerListFilters } from '@/features/catalog/utils/partner-filters';
import { PARTNER_COMPANY_TYPES } from '@/features/partners/constants';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Select } from '@/shared/ui/select';

type PartnerFiltersFormProps = {
  filters: PartnerListFilters;
  labels: {
    type: string;
    allTypes: string;
    types: Record<(typeof PARTNER_COMPANY_TYPES)[number], string>;
    apply: string;
    reset: string;
  };
};

/**
 * Server-friendly partner type filter form for the public list.
 */
export const PartnerFiltersForm = ({ filters, labels }: PartnerFiltersFormProps) => {
  const action = '/partners';

  return (
    <form method="get" action={action} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-secondary">
        {labels.type}
        <Select name="type" defaultValue={filters.type} className="min-w-[12rem]">
          <option value="">{labels.allTypes}</option>
          {PARTNER_COMPANY_TYPES.map((type) => (
            <option key={type} value={type}>
              {labels.types[type]}
            </option>
          ))}
        </Select>
      </label>
      <Button type="submit" variant="secondary" size="md" className="h-11">
        {labels.apply}
      </Button>
      {filters.type || filters.page > 1 ? (
        <Link href="/partners">
          <Button type="button" variant="outline" size="md" className="h-11">
            {labels.reset}
          </Button>
        </Link>
      ) : null}
    </form>
  );
};
