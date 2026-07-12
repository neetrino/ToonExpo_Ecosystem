import { Link } from '@/i18n/navigation';
import { MONTHS_PER_YEAR } from '@/lib/mortgage/calc';
import type { PublicBankOfferListing } from '@/lib/partners/queries';

type MortgageOffersSectionLabels = {
  offersTitle: string;
  featured: string;
  maxTerm: string;
  viewBank: string;
  emptyOffers: string;
  selectOffer: string;
  yearsUnit: string;
};

type MortgageOffersSectionProps = {
  offers: PublicBankOfferListing[];
  selectedOfferId: string | null;
  labels: MortgageOffersSectionLabels;
  onSelectOffer: (offerId: string) => void;
  onClearSelection: () => void;
};

function MortgageOfferItem({
  offer,
  isSelected,
  labels,
  onSelect,
}: {
  offer: PublicBankOfferListing;
  isSelected: boolean;
  labels: MortgageOffersSectionLabels;
  onSelect: () => void;
}) {
  const termYearsLabel = Math.round(offer.maxTermMonths / MONTHS_PER_YEAR);

  return (
    <li>
      <button
        type="button"
        className={
          isSelected
            ? 'catalog-mortgage-offer catalog-mortgage-offer--selected'
            : 'catalog-mortgage-offer'
        }
        onClick={onSelect}
        aria-pressed={isSelected}
      >
        <div className="catalog-mortgage-offer__header">
          <div>
            <p className="catalog-mortgage-offer__bank">{offer.partnerName}</p>
            <h3 className="catalog-mortgage-offer__title">{offer.title}</h3>
          </div>
          {offer.featured ? (
            <span className="catalog-badge catalog-badge--featured">{labels.featured}</span>
          ) : null}
        </div>
        <p className="catalog-mortgage-offer__rate">
          {offer.interestRate}% · {labels.maxTerm}: {termYearsLabel} {labels.yearsUnit}
        </p>
        {offer.description ? (
          <p className="catalog-mortgage-offer__description">{offer.description}</p>
        ) : null}
        <Link
          href={`/partners/${offer.partnerSlug}`}
          className="catalog-mortgage-offer__bank-link"
          onClick={(event) => event.stopPropagation()}
        >
          {labels.viewBank}
        </Link>
      </button>
    </li>
  );
}

export function MortgageOffersSection({
  offers,
  selectedOfferId,
  labels,
  onSelectOffer,
  onClearSelection,
}: MortgageOffersSectionProps) {
  return (
    <section className="catalog-mortgage__offers" aria-labelledby="mortgage-offers-title">
      <h2 id="mortgage-offers-title" className="catalog-section-title">
        {labels.offersTitle}
      </h2>

      {offers.length === 0 ? (
        <p className="catalog-empty">{labels.emptyOffers}</p>
      ) : (
        <ul className="catalog-mortgage__offer-list">
          {offers.map((offer) => (
            <MortgageOfferItem
              key={offer.id}
              offer={offer}
              isSelected={offer.id === selectedOfferId}
              labels={labels}
              onSelect={() => onSelectOffer(offer.id)}
            />
          ))}
        </ul>
      )}

      {offers.length > 0 ? (
        <button
          type="button"
          className="catalog-mortgage__manual-toggle"
          onClick={onClearSelection}
        >
          {labels.selectOffer}
        </button>
      ) : null}
    </section>
  );
}
