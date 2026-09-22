import { getTranslations } from 'next-intl/server';

import { HomeDevelopmentsMap } from '@/features/catalog/components/home-developments-map';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';
import { SectionHeader } from '@/shared/ui/section-header';

/**
 * Home band with the interactive 3D city map of all published developments.
 */
export const HomeMapSection = async () => {
  const t = await getTranslations('HomePage.developments');

  return (
    <section className="border-y border-header-border bg-band-mist/30">
      <div className="page-container section-pad">
        <Reveal>
          <SectionHeader
            className="mb-6"
            eyebrow={t('mapEyebrow')}
            title={t('mapTitle')}
            action={
              <Link
                href="/map"
                className="shrink-0 pb-1 text-sm font-semibold text-brand-deep transition-colors hover:text-brand-deep/80"
              >
                {t('openFullMap')}
              </Link>
            }
          />
        </Reveal>
        <Reveal delayMs={80}>
          <HomeDevelopmentsMap />
        </Reveal>
      </div>
    </section>
  );
};
