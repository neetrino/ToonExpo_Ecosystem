'use client';

import { useTranslations } from 'next-intl';

import { MortgageCalculatorSection } from '@/features/mortgage/components/mortgage-calculator-section';
import { usePublicMortgageOffersQuery } from '@/features/mortgage/hooks/use-public-mortgage';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Public mortgage page — mist hero under nav + calculator (Figma `105:2567`).
 */
export const MortgagePageContent = () => {
  const t = useTranslations('Mortgage');
  const query = usePublicMortgageOffersQuery();

  return (
    <>
      <section className="-mt-[4.5rem] border-b border-header-border bg-band-mist/30 pt-[4.5rem]">
        <div className="page-container pt-[clamp(3.5rem,8vw,5rem)] pb-[clamp(3.5rem,8vw,5.5rem)]">
          <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
            {t('eyebrow')}
          </p>
          <h1 className="mt-3 max-w-3xl font-brand text-[clamp(2.25rem,5.5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
            {t('titleLine1')}
            <br />
            {t('titleLine2')}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-7 text-header-muted">{t('subtitle')}</p>
        </div>
      </section>

      <section className="page-container py-12 pb-24 sm:py-16">
        {query.isLoading ? (
          <div className="flex flex-col gap-6">
            <Skeleton className="h-72 w-full max-w-md rounded-[24px]" />
            <Skeleton className="h-24 w-full rounded-[20px]" />
          </div>
        ) : null}

        {query.isError || (!query.isLoading && !query.data) ? (
          <p
            role="alert"
            className="rounded-[20px] border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
          >
            {t('error')}
          </p>
        ) : null}

        {query.data && query.data.data.length === 0 ? (
          <p className="rounded-[20px] border border-dashed border-header-border bg-surface-elevated px-6 py-12 text-center text-sm text-header-muted">
            {t('empty')}
          </p>
        ) : null}

        {query.data && query.data.data.length > 0 ? (
          <MortgageCalculatorSection offers={query.data.data} />
        ) : null}
      </section>
    </>
  );
};
