'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';

import { MortgageCalculatorSection } from '@/features/mortgage/components/mortgage-calculator-section';
import { usePublicMortgageOffersQuery } from '@/features/mortgage/hooks/use-public-mortgage';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Public mortgage page content: offers list and calculator.
 */
export const MortgagePageContent = () => {
  const t = useTranslations('Mortgage');
  const query = usePublicMortgageOffersQuery();

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {t('error')}
      </p>
    );
  }

  const offers = query.data.data;

  return (
    <div className="flex flex-col gap-8">
      <div className="relative overflow-hidden rounded-lg border border-border/80 bg-surface-elevated shadow-card">
        <div className="grid lg:grid-cols-2">
          <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
            <p className="text-eyebrow mb-2">ToonExpo</p>
            <h1 className="text-page-title text-ink">{t('title')}</h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-secondary">
              {t('subtitle')}
            </p>
          </div>
          <div className="relative min-h-44 lg:min-h-full">
            <Image
              src="/demo/mortgage-hero.jpg"
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-surface-elevated via-transparent to-transparent max-lg:from-transparent max-lg:via-transparent max-lg:to-transparent max-lg:bg-ink/10" />
          </div>
        </div>
      </div>

      {offers.length === 0 ? (
        <p className="rounded-md border border-dashed border-border bg-surface/50 px-6 py-12 text-center text-sm text-ink-secondary">
          {t('empty')}
        </p>
      ) : (
        <MortgageCalculatorSection offers={offers} />
      )}
    </div>
  );
};
