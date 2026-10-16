'use client';

import { useQuery } from '@tanstack/react-query';
import { useLocale, useTranslations } from 'next-intl';

import { listPortalMortgageApplications } from '@/features/partner/api/portal-bank-offers-api';
import { formatMortgageAmount } from '@/features/mortgage/utils/format-mortgage-amount';

const APPLICATIONS_QUERY_KEY = ['portal', 'mortgage-applications'] as const;

/**
 * Applications buyers sent from the public calculator.
 */
export const PartnerMortgageApplications = () => {
  const t = useTranslations('Partner.bankOffers.applications');
  const locale = useLocale();
  const query = useQuery({
    queryKey: APPLICATIONS_QUERY_KEY,
    queryFn: listPortalMortgageApplications,
  });

  if (query.isError) {
    return (
      <p role="alert" className="mt-10 text-sm text-danger">
        {t('error')}
      </p>
    );
  }

  const items = query.data?.data ?? [];

  return (
    <section className="mt-10">
      <h2 className="font-brand text-lg font-bold text-ink-navy">{t('title')}</h2>
      {query.isLoading ? null : items.length === 0 ? (
        <p className="mt-3 text-sm text-header-muted">{t('empty')}</p>
      ) : (
        <ul className="mt-4 flex flex-col gap-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="rounded-[16px] border border-header-border bg-surface-elevated p-4"
            >
              <p className="text-sm font-semibold text-ink-navy">{item.buyerName}</p>
              <p className="text-sm text-header-muted">{item.buyerEmail}</p>
              <p className="mt-2 text-sm text-ink-navy">
                {item.offerTitle} · {t('term', { years: item.loanTermYears })} ·{' '}
                {t('monthly', { amount: formatMortgageAmount(item.monthlyPayment, locale) })}
              </p>
              {item.note ? <p className="mt-2 text-sm text-ink-secondary">{item.note}</p> : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
