import type { PublicBuilderSummary } from '@toonexpo/contracts';

type ProjectFiltersFormProps = {
  builders: PublicBuilderSummary[];
  currentCity?: string;
  currentBuilderSlug?: string;
  labels: {
    city: string;
    cityPlaceholder: string;
    builder: string;
    builderAll: string;
    apply: string;
    clear: string;
    ariaLabel: string;
  };
};

export function ProjectFiltersForm({
  builders,
  currentCity,
  currentBuilderSlug,
  labels,
}: ProjectFiltersFormProps) {
  return (
    <form className="catalog-filters" method="get" aria-label={labels.ariaLabel}>
      <label className="catalog-filters__field">
        <span className="catalog-filters__label">{labels.city}</span>
        <input
          type="search"
          name="city"
          className="catalog-filters__input"
          placeholder={labels.cityPlaceholder}
          defaultValue={currentCity ?? ''}
          maxLength={80}
        />
      </label>
      <label className="catalog-filters__field">
        <span className="catalog-filters__label">{labels.builder}</span>
        <select
          name="builder"
          className="catalog-filters__select"
          defaultValue={currentBuilderSlug ?? ''}
        >
          <option value="">{labels.builderAll}</option>
          {builders.map((builder) => (
            <option key={builder.id} value={builder.slug}>
              {builder.name}
            </option>
          ))}
        </select>
      </label>
      <div className="catalog-filters__actions">
        <button type="submit" className="catalog-filters__button catalog-filters__button--primary">
          {labels.apply}
        </button>
        <a href="/projects" className="catalog-filters__button catalog-filters__button--secondary">
          {labels.clear}
        </a>
      </div>
    </form>
  );
}
