import { getTranslations } from 'next-intl/server';

import { MortgagePreviewCard } from '@/features/catalog/components/mortgage-preview-card';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';
import { cn } from '@/shared/ui/cn';

/**
 * Mortgage marketplace band — copy + estimate card (Figma `81:433` + `81:442`).
 */
export const HomeMortgage = async () => {
  const t = await getTranslations('HomePage.mortgage');

  return (
    <section className="section-pad bg-canvas">
      <div className="page-container">
        <Reveal>
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <p className="text-eyebrow">{t('eyebrow')}</p>
              <h2 className="mt-3 max-w-xl font-brand text-[clamp(1.85rem,4vw,3rem)] font-bold leading-[1.15] tracking-[-0.02em] text-ink-navy">
                {t('title')}
              </h2>
              <p className="mt-6 max-w-md text-lg leading-7 text-header-muted">
                {t('description')}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/mortgage"
                  className={cn(
                    'inline-flex h-[46px] items-center justify-center rounded-md bg-brand-deep px-6',
                    'text-sm font-semibold text-on-dark transition-colors hover:bg-brand-deep/90',
                  )}
                >
                  {t('cta')}
                </Link>
                <Link
                  href="/partners"
                  className={cn(
                    'inline-flex h-[46px] items-center justify-center rounded-md border border-header-border',
                    'bg-surface-elevated px-6 text-sm font-semibold text-ink-navy',
                    'transition-colors hover:border-brand/40',
                  )}
                >
                  {t('partnersCta')}
                </Link>
              </div>
            </div>

            <MortgagePreviewCard />
          </div>
        </Reveal>
      </div>
    </section>
  );
};
