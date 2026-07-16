import type { PublicBuilderSummary } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';

type BuilderCardProps = {
  builder: PublicBuilderSummary;
  projectCountLabel: string;
};

function BuilderLogo({ builder }: { builder: PublicBuilderSummary }) {
  if (builder.logoUrl) {
    return <img src={builder.logoUrl} alt="" className="catalog-builder-card__logo-image" />;
  }

  const initial = builder.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="catalog-builder-card__logo-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}

export function BuilderCard({ builder, projectCountLabel }: BuilderCardProps) {
  return (
    <Link href={`/builders/${builder.slug}`} className="catalog-builder-card">
      <div className="catalog-builder-card__logo">
        <BuilderLogo builder={builder} />
      </div>
      <div className="catalog-builder-card__body">
        <div className="catalog-builder-card__meta">
          <h2 className="catalog-builder-card__title">{builder.name}</h2>
          {builder.city ? <span className="catalog-builder-card__city">{builder.city}</span> : null}
        </div>
        {builder.description ? (
          <p className="catalog-builder-card__description">{builder.description}</p>
        ) : null}
        <p className="catalog-builder-card__count">{projectCountLabel}</p>
      </div>
    </Link>
  );
}
