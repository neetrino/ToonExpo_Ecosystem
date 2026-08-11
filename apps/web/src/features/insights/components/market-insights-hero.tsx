import { getTranslations } from 'next-intl/server';

/**
 * Market insights page hero — matches mortgage mist band chrome.
 */
export const MarketInsightsHero = async () => {
  const t = await getTranslations('MarketInsights');

  return (
    <section className="-mt-[4.5rem] border-b border-header-border bg-band-mist/30 pt-[4.5rem]">
      <div className="page-container pt-[clamp(3.5rem,8vw,5rem)] pb-[clamp(3.5rem,8vw,5.5rem)]">
        <p className="text-[11px] font-bold tracking-[0.2em] text-brand-secondary uppercase">
          {t('eyebrow')}
        </p>
        <h1 className="mt-3 max-w-3xl font-brand text-[clamp(2.25rem,5.5vw,3.75rem)] font-bold leading-[1.15] tracking-[-0.03em] text-ink-navy">
          {t('title')}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-7 text-header-muted">{t('subtitle')}</p>
      </div>
    </section>
  );
};
