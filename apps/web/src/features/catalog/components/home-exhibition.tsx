import Image from 'next/image';
import { getTranslations } from 'next-intl/server';

import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';

/**
 * Exhibition experience — photo-led editorial band (map, QR, visit flow).
 */
export const HomeExhibition = async () => {
  const t = await getTranslations('HomePage');

  const items = [
    { title: t('exhibition.items.map.title'), body: t('exhibition.items.map.body') },
    { title: t('exhibition.items.qr.title'), body: t('exhibition.items.qr.body') },
    { title: t('exhibition.items.scan.title'), body: t('exhibition.items.scan.body') },
    { title: t('exhibition.items.builders.title'), body: t('exhibition.items.builders.body') },
  ] as const;

  return (
    <section className="overflow-hidden bg-surface-inverse text-on-dark">
      <div className="grid lg:grid-cols-12 lg:min-h-[34rem]">
        <div className="relative min-h-72 lg:col-span-5 lg:min-h-full">
          <Image
            src="/demo/venue-map.webp"
            alt=""
            fill
            className="banner-media-drift object-cover object-[center_40%]"
            sizes="(max-width: 1024px) 100vw, 42vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-inverse via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-transparent lg:to-surface-inverse/90" />
        </div>

        <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:col-span-7 lg:px-14 lg:py-20">
          <Reveal>
            <p className="text-eyebrow text-accent">{t('exhibition.eyebrow')}</p>
            <h2 className="mt-3 max-w-lg text-[clamp(1.65rem,3.2vw,2.35rem)] font-semibold tracking-tight text-on-dark">
              {t('exhibition.title')}
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-on-dark/70 sm:text-base">
              {t('exhibition.description')}
            </p>
          </Reveal>

          <ol className="mt-10 grid gap-6 sm:grid-cols-2">
            {items.map((item, index) => (
              <Reveal key={item.title} delayMs={60 + index * 50} as="li">
                <div className="flex gap-4">
                  <span
                    className="mt-0.5 font-display text-sm font-semibold tabular-nums text-accent"
                    aria-hidden
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold tracking-tight text-on-dark">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-on-dark/60">{item.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>

          <Reveal delayMs={220}>
            <div className="mt-10">
              <Link href="/expo">
                <Button
                  variant="outline"
                  className="border-on-dark/30 bg-transparent text-on-dark hover:bg-on-dark/10"
                >
                  {t('exhibition.cta')}
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
