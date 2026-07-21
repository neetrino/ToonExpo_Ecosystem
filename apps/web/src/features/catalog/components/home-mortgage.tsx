import { Calculator, Landmark } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';

/**
 * Mortgage / financing preview with CTA to the calculator page.
 */
export const HomeMortgage = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="section-pad">
      <div className="page-container">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-border bg-surface-elevated shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <p className="text-eyebrow mb-3">{t('mortgage.eyebrow')}</p>
                <h2 className="text-section-title text-ink">{t('mortgage.title')}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-secondary">
                  {t('mortgage.description')}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link href="/mortgage">
                    <Button variant="secondary" size="lg">
                      <Calculator className="size-4" aria-hidden />
                      {t('mortgage.cta')}
                    </Button>
                  </Link>
                  <Link href="/partners">
                    <Button variant="outline" size="lg">
                      {t('mortgage.partnersCta')}
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative flex min-h-56 items-center justify-center bg-gradient-to-br from-brand-soft via-surface to-info-soft p-8 lg:min-h-full">
                <div className="w-full max-w-sm rounded-md border border-border bg-surface-elevated p-6 shadow-md">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-sm bg-brand-soft text-brand">
                    <Landmark className="size-5" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-ink">{t('mortgage.cardTitle')}</p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-secondary">
                    {t('mortgage.cardBody')}
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-ink-secondary">
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                      {t('mortgage.bullets.rates')}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                      {t('mortgage.bullets.terms')}
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="size-1.5 rounded-full bg-brand" aria-hidden />
                      {t('mortgage.bullets.compare')}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
