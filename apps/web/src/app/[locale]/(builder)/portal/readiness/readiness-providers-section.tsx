import { Link } from '@/i18n/navigation';
import type { CategoryProviderGroup } from '@/lib/readiness/builder-queries';

type ReadinessProvidersSectionProps = {
  groups: CategoryProviderGroup[];
  categoryLabel: (key: string, fallback: string) => string;
  labels: {
    title: string;
    description: string;
    openProfile: string;
    contact: string;
  };
};

export function ReadinessProvidersSection({
  groups,
  categoryLabel,
  labels,
}: ReadinessProvidersSectionProps) {
  return (
    <section className="portal-section">
      <h3 className="portal-section__title">{labels.title}</h3>
      <p className="portal-page__subtitle">{labels.description}</p>

      {groups.map((group) => (
        <div key={group.categoryKey} className="portal-section">
          <h4 className="portal-section__title">
            {categoryLabel(group.categoryKey, group.categoryName)}
          </h4>
          <ul className="portal-list">
            {group.providers.map((provider) => (
              <li key={provider.id} className="portal-list__item">
                <div className="portal-page__heading">
                  <strong>{provider.name}</strong>
                  <Link className="portal-link" href={`/partners/${provider.slug}`}>
                    {labels.openProfile}
                  </Link>
                </div>
                {provider.description ? <p>{provider.description}</p> : null}
                <p className="portal-page__subtitle">
                  {labels.contact}
                  {provider.phone ? ` · ${provider.phone}` : ''}
                  {provider.email ? ` · ${provider.email}` : ''}
                  {provider.website ? ` · ${provider.website}` : ''}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
