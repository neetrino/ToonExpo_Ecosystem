import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { staticAssetUrl } from '@/shared/lib/static-asset-url';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';

/**
 * Closing CTA — full-bleed venue photo with editorial copy block.
 */
export const HomeFinalCta = async () => {
  const t = await getTranslations('HomePage');

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={staticAssetUrl('/demo/expo-venue.webp')}
          alt=""
          fill
          className="banner-media-drift object-cover object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-ink/72" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-brand-secondary/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/50 via-transparent to-transparent" />
      </div>

      <div className="page-container relative section-pad-lg">
        <Reveal>
          <div className="max-w-xl">
            <p className="text-eyebrow text-accent">{t('finalCta.eyebrow')}</p>
            <h2 className="mt-4 text-[clamp(1.85rem,4vw,2.75rem)] font-semibold tracking-tight text-on-dark">
              {t('finalCta.title')}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-on-dark/75">
              {t('finalCta.description')}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
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
                  className="border-on-dark/30 bg-transparent text-on-dark hover:bg-on-dark/10"
                >
                  {t('finalCta.browse')}
                </Button>
              </Link>
              <Link href="/expo">
                <Button
                  size="lg"
                  variant="ghost"
                  className="text-on-dark/85 hover:bg-on-dark/10 hover:text-on-dark"
                >
                  {t('finalCta.expo')}
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};
