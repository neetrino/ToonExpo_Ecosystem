import type { PartnerListFilters } from "@/features/catalog/utils/partner-filters";
import { PARTNER_COMPANY_TYPES } from "@/features/partners/constants";
import { Link } from "@/i18n/navigation";

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
export const PartnerFiltersForm = ({
  filters,
  labels,
}: PartnerFiltersFormProps) => {
  const action = "/partners";

  return (
    <form method="get" action={action} className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-xs text-ink-muted">
        {labels.type}
        <select
          name="type"
          defaultValue={filters.type}
          className="h-10 min-w-[12rem] rounded-sm border border-border bg-background px-3 text-sm text-ink"
        >
          <option value="">{labels.allTypes}</option>
          {PARTNER_COMPANY_TYPES.map((type) => (
            <option key={type} value={type}>
              {labels.types[type]}
            </option>
          ))}
        </select>
      </label>
      <button
        type="submit"
        className="inline-flex h-10 items-center justify-center rounded-sm bg-cta-dark px-4 text-sm font-medium text-on-dark hover:bg-cta-dark/90"
      >
        {labels.apply}
      </button>
      {filters.type || filters.page > 1 ? (
        <Link
          href="/partners"
          className="inline-flex h-10 items-center justify-center rounded-sm border border-border px-4 text-sm font-medium text-ink hover:bg-surface"
        >
          {labels.reset}
        </Link>
      ) : null}
    </form>
  );
};
