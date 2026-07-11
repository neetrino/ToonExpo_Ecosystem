import type { PublicBankOffer, PublicPartnerDetail } from '@toonexpo/contracts';

import { Link } from '@/i18n/navigation';
import { formatPriceAmd } from '@/lib/catalog/format-price';

type PartnerDetailViewProps = {
  partner: PublicPartnerDetail;
  locale: string;
  labels: {
    type: string;
    contacts: string;
    phone: string;
    email: string;
    website: string;
    serviceCategories: string;
    bankOffers: string;
    featured: string;
    interestRate: string;
    maxTerm: string;
    maxAmount: string;
    mortgageLink: string;
    noValue: string;
  };
};

function PartnerLogo({ partner }: { partner: PublicPartnerDetail }) {
  if (partner.logoUrl) {
    return <img src={partner.logoUrl} alt="" className="catalog-partner-detail__logo-image" />;
  }

  const initial = partner.name.trim().charAt(0).toUpperCase() || '?';

  return (
    <div className="catalog-partner-detail__logo-fallback" aria-hidden="true">
      {initial}
    </div>
  );
}

function BankOfferCard({
  offer,
  locale,
  labels,
}: {
  offer: PublicBankOffer;
  locale: string;
  labels: PartnerDetailViewProps['labels'];
}) {
  const termYears = Math.round(offer.maxTermMonths / 12);

  return (
    <article
      className={
        offer.featured ? 'catalog-bank-offer catalog-bank-offer--featured' : 'catalog-bank-offer'
      }
    >
      <div className="catalog-bank-offer__header">
        <h3 className="catalog-bank-offer__title">{offer.title}</h3>
        {offer.featured ? (
          <span className="catalog-badge catalog-badge--featured">{labels.featured}</span>
        ) : null}
      </div>
      <dl className="catalog-bank-offer__facts">
        <div>
          <dt>{labels.interestRate}</dt>
          <dd>{offer.interestRate}%</dd>
        </div>
        <div>
          <dt>{labels.maxTerm}</dt>
          <dd>{termYears}</dd>
        </div>
        <div>
          <dt>{labels.maxAmount}</dt>
          <dd>
            {offer.maxAmountAmd ? formatPriceAmd(offer.maxAmountAmd, locale) : labels.noValue}
          </dd>
        </div>
      </dl>
      {offer.description ? (
        <p className="catalog-bank-offer__description">{offer.description}</p>
      ) : null}
    </article>
  );
}

export function PartnerDetailView({ partner, locale, labels }: PartnerDetailViewProps) {
  return (
    <article className="catalog-detail catalog-partner-detail">
      <header className="catalog-partner-detail__header">
        <div className="catalog-partner-detail__logo">
          <PartnerLogo partner={partner} />
        </div>
        <div className="catalog-partner-detail__intro">
          <h1 className="catalog-detail__title">{partner.name}</h1>
          <p className="catalog-partner-detail__type">{labels.type}</p>
          {partner.description ? (
            <p className="catalog-detail__description">{partner.description}</p>
          ) : null}
        </div>
      </header>

      {partner.phone || partner.email || partner.website ? (
        <section className="catalog-partner-detail__section">
          <h2 className="catalog-section-title">{labels.contacts}</h2>
          <ul className="catalog-partner-detail__contacts">
            {partner.phone ? (
              <li>
                <span className="catalog-partner-detail__contact-label">{labels.phone}</span>
                <a href={`tel:${partner.phone}`}>{partner.phone}</a>
              </li>
            ) : null}
            {partner.email ? (
              <li>
                <span className="catalog-partner-detail__contact-label">{labels.email}</span>
                <a href={`mailto:${partner.email}`}>{partner.email}</a>
              </li>
            ) : null}
            {partner.website ? (
              <li>
                <span className="catalog-partner-detail__contact-label">{labels.website}</span>
                <a href={partner.website} rel="noopener noreferrer" target="_blank">
                  {partner.website}
                </a>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      {partner.serviceCategories.length > 0 ? (
        <section className="catalog-partner-detail__section">
          <h2 className="catalog-section-title">{labels.serviceCategories}</h2>
          <ul className="catalog-partner-detail__chips">
            {partner.serviceCategories.map((category) => (
              <li key={category} className="catalog-chip">
                {category}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {partner.type === 'BANK' && partner.bankOffers.length > 0 ? (
        <section className="catalog-partner-detail__section">
          <div className="catalog-partner-detail__section-header">
            <h2 className="catalog-section-title">{labels.bankOffers}</h2>
            <Link href="/mortgage" className="catalog-partner-detail__mortgage-link">
              {labels.mortgageLink}
            </Link>
          </div>
          <div className="catalog-bank-offers">
            {partner.bankOffers.map((offer) => (
              <BankOfferCard key={offer.id} offer={offer} locale={locale} labels={labels} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
