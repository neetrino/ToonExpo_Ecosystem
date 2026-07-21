import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';

/**
 * Closing CTA band for registration, catalog, and exhibition.
 */
export const HomeFinalCta = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="section-pad">
      <div className="page-container">
        <Reveal>
          <div className="relative overflow-hidden rounded-lg bg-cta-dark px-6 py-12 text-center text-on-dark sm:px-10 sm:py-16">
            <div
              className="cta-band-glow pointer-events-none absolute inset-0 opacity-40"
              aria-hidden
            />
            <div className="relative mx-auto max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-dark/55">
                {t('finalCta.eyebrow')}
              </p>
              <h2 className="mt-3 text-[clamp(1.5rem,3.5vw,2.25rem)] font-semibold tracking-tight">
                {t('finalCta.title')}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-on-dark/70 sm:text-base">
                {t('finalCta.description')}
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link href="/auth/register">
                  <Button size="lg" className="bg-brand text-on-brand hover:bg-brand-hover">
                    {t('finalCta.register')}
                    <ArrowRight className="size-4" aria-hidden />
                  </Button>
                </Link>
                <Link href="/projects">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-on-dark/25 bg-transparent text-on-dark hover:bg-on-dark/10"
                  >
                    {t('finalCta.browse')}
                  </Button>
                </Link>
                <Link href="/expo">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="border-transparent text-on-dark/80 hover:bg-on-dark/10 hover:text-on-dark"
                  >
                    {t('finalCta.expo')}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
