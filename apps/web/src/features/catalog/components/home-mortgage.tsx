import Image from 'next/image';
import { Calculator } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';

/**
 * Mortgage / financing preview — photo-led split with calculator CTA.
 */
export const HomeMortgage = async () => {
  const t = await getTranslations('HomePage');

  const bullets = [
    t('mortgage.bullets.rates'),
    t('mortgage.bullets.terms'),
    t('mortgage.bullets.compare'),
  ] as const;

  return (
    <section className="section-pad">
      <div className="page-container">
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-border/70 bg-surface-elevated shadow-card">
            <div className="grid lg:grid-cols-2">
              <div className="flex flex-col justify-center p-8 sm:p-10 lg:p-12">
                <p className="text-eyebrow mb-3">{t('mortgage.eyebrow')}</p>
                <h2 className="text-section-title text-ink">{t('mortgage.title')}</h2>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-secondary">
                  {t('mortgage.description')}
                </p>
                <ul className="mt-6 space-y-2.5">
                  {bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="flex items-start gap-2.5 text-sm text-ink-secondary"
                    >
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" aria-hidden />
                      {bullet}
                    </li>
                  ))}
                </ul>
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

              <div className="relative min-h-64 lg:min-h-full">
                <Image
                  src="/demo/mortgage-hero.jpg"
                  alt=""
                  fill
                  className="banner-media-drift object-cover object-[center_30%]"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/55 via-ink/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="max-w-xs text-sm font-medium leading-snug text-on-dark">
                    {t('mortgage.cardTitle')}
                  </p>
                  <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-on-dark/75">
                    {t('mortgage.cardBody')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
