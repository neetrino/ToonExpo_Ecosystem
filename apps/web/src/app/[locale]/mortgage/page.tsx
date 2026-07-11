import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getPublishedBankOffers } from '@/lib/partners/queries';

import { MortgageCalculator } from './mortgage-calculator';

type MortgagePageProps = {
  params: Promise<{ locale: string }>;
};

export default async function MortgagePage({ params }: MortgagePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('catalog.mortgage');
  const offers = await getPublishedBankOffers();

  return (
    <section className="catalog-page">
      <header className="catalog-page__header">
        <h1 className="catalog-page__title">{t('title')}</h1>
        <p className="catalog-page__subtitle">{t('subtitle')}</p>
      </header>

      <MortgageCalculator
        offers={offers}
        locale={locale}
        labels={{
          title: t('calculator.title'),
          propertyPrice: t('calculator.propertyPrice'),
          downPayment: t('calculator.downPayment'),
          termYears: t('calculator.termYears'),
          interestRate: t('calculator.interestRate'),
          manualRate: t('calculator.manualRate'),
          monthlyPayment: t('calculator.monthlyPayment'),
          loanAmount: t('calculator.loanAmount'),
          totalPayment: t('calculator.totalPayment'),
          overpayment: t('calculator.overpayment'),
          disclaimer: t('calculator.disclaimer'),
          offersTitle: t('offers.title'),
          featured: t('offers.featured'),
          maxTerm: t('offers.maxTerm'),
          viewBank: t('offers.viewBank'),
          emptyOffers: t('offers.empty'),
          selectOffer: t('offers.selectManual'),
          yearsUnit: t('offers.yearsUnit'),
        }}
      />
    </section>
  );
}
