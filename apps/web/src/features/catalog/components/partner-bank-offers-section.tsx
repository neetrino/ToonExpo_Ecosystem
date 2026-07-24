import type { PublicPartnerBankOfferItem } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';

import { cn } from '@/shared/ui/cn';

type PartnerBankOffersSectionProps = {
  partnerName: string;
  offers: PublicPartnerBankOfferItem[];
};

/**
 * Read-only mortgage offer cards on a bank partner profile.
 */
export const PartnerBankOffersSection = async ({
  partnerName,
  offers,
}: PartnerBankOffersSectionProps) => {
  const t = await getTranslations('Catalog.partnersPage.detail');
  const tMortgage = await getTranslations('Mortgage.offers');

  if (offers.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="font-brand text-2xl font-bold tracking-[-0.02em] text-ink-navy">
          {t('bankOffersTitle')}
        </h2>
        <Link
          href="/mortgage"
          className="text-sm font-semibold text-brand-deep transition-colors hover:text-brand"
        >
          {t('mortgageCalculatorCta')}
        </Link>
      </div>

      <ul className="flex flex-col gap-3">
        {offers.map((offer) => (
          <li
            key={offer.id}
            className={cn(
              'flex flex-col gap-4 rounded-[20px] bg-surface-elevated p-5',
              'shadow-[0_0_0_1px_var(--color-header-border)]',
              'sm:flex-row sm:items-center sm:justify-between sm:gap-6',
            )}
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-brand text-lg font-bold tracking-tight text-ink-navy">
                  {partnerName}
                </h3>
                {offer.featured ? (
                  <span className="rounded-[10px] bg-band-mist px-2 py-0.5 text-[10px] font-bold tracking-widest text-brand-deep uppercase">
                    {tMortgage('featured')}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm leading-5 text-header-muted">
                {offer.shortDescription ?? offer.title}
              </p>
            </div>

            <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 sm:gap-x-8">
              <Metric label={tMortgage('rate')} value={`${offer.rate}%`} />
              <Metric label={tMortgage('apr')} value={offer.apr != null ? `${offer.apr}%` : '—'} />
              <Metric label={tMortgage('minDown')} value={`${offer.minDownPaymentPercent}%`} />
            </dl>
          </li>
        ))}
      </ul>
    </section>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div>
    <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">{label}</dt>
    <dd className="mt-0.5 font-brand text-lg font-bold leading-7 text-ink-navy">{value}</dd>
  </div>
);
