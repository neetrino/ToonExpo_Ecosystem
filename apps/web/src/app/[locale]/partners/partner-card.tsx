import type { PublicPartnerSummary } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';

type PartnerCardProps = {
  partner: PublicPartnerSummary;
  typeLabel: string;
};

function PartnerLogo({ partner }: { partner: PublicPartnerSummary }) {
  if (partner.logoUrl) {
    return <img src={partner.logoUrl} alt="" className="catalog-partner-card__logo-image" />;
  }

  const initial = partner.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="catalog-partner-card__logo-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}

export function PartnerCard({ partner, typeLabel }: PartnerCardProps) {
  return (
    <Link href={`/partners/${partner.slug}`} className="catalog-partner-card">
      <div className="catalog-partner-card__logo">
        <PartnerLogo partner={partner} />
      </div>
      <div className="catalog-partner-card__body">
        <div className="catalog-partner-card__meta">
          <h2 className="catalog-partner-card__title">{partner.name}</h2>
          <span className="catalog-badge catalog-badge--partner-type">{typeLabel}</span>
        </div>
        {partner.description ? (
          <p className="catalog-partner-card__description">{partner.description}</p>
        ) : null}
      </div>
    </Link>
  );
}
