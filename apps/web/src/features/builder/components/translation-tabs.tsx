'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import { cn } from '@/shared/ui/cn';

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

export type { TranslationLocale };

type TranslationTabContext = {
  isActive: boolean;
};

type TranslationTabsProps = {
  children: (locale: TranslationLocale, context: TranslationTabContext) => ReactNode;
  /** Jump to this locale when `focusTick` changes (hidden-tab validation). */
  focusLocale?: TranslationLocale | undefined;
  focusTick?: number | undefined;
};

type IndicatorMetrics = {
  left: number;
  width: number;
};

/** Active tab underline — 1 layout px (same at every fluid scale). */
const TAB_UNDERLINE_CLASS = 'h-px';

const isTranslationLocale = (value: string): value is TranslationLocale =>
  (TRANSLATION_LOCALES as readonly string[]).includes(value);

const resolveTranslationLocale = (value: string): TranslationLocale =>
  isTranslationLocale(value) ? value : 'hy';

/**
 * hy / ru / en tab switcher with a sliding underline.
 * All locale panels stay mounted (hidden when inactive) so each language keeps
 * its own form fields. Shared values (media, URLs, slug) belong outside the tabs.
 */
export const TranslationTabs = ({ children, focusLocale, focusTick }: TranslationTabsProps) => {
  const t = useTranslations('Builder.locales');
  const siteLocale = resolveTranslationLocale(useLocale());
  const tabsId = useId();
  const [active, setActive] = useState<TranslationLocale>(siteLocale);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TranslationLocale, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<IndicatorMetrics>({ left: 0, width: 0 });
  const previousSiteLocaleRef = useRef(siteLocale);

  useEffect(() => {
    if (previousSiteLocaleRef.current === siteLocale) {
      return;
    }
    previousSiteLocaleRef.current = siteLocale;
    setActive(siteLocale);
  }, [siteLocale]);

  useEffect(() => {
    if (!focusLocale) {
      return;
    }
    setActive(focusLocale);
  }, [focusLocale, focusTick]);

  useLayoutEffect(() => {
    const updateIndicator = (): void => {
      const list = listRef.current;
      const tab = tabRefs.current[active];
      if (!list || !tab) {
        return;
      }
      setIndicator({
        left: tab.offsetLeft - list.scrollLeft,
        width: tab.offsetWidth,
      });
    };

    updateIndicator();
    const list = listRef.current;
    const resizeObserver = list ? new ResizeObserver(updateIndicator) : null;
    if (list) {
      resizeObserver?.observe(list);
    }
    window.addEventListener('resize', updateIndicator);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateIndicator);
    };
  }, [active]);

  const selectLocale = (locale: TranslationLocale): void => {
    if (locale === active) {
      return;
    }
    setActive(locale);
  };

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={listRef}
        role="tablist"
        aria-label={t('label')}
        className="relative flex gap-1 border-b border-border"
      >
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute bottom-0 bg-brand',
            TAB_UNDERLINE_CLASS,
            'transition-[transform,width] duration-[var(--duration-base)] ease-[var(--ease-out-premium)]',
            'motion-reduce:transition-none',
          )}
          style={{
            width: indicator.width,
            transform: `translateX(${indicator.left}px)`,
          }}
        />
        {TRANSLATION_LOCALES.map((locale) => (
          <button
            key={locale}
            ref={(node) => {
              tabRefs.current[locale] = node;
            }}
            type="button"
            id={`translation-tab-${tabsId}-${locale}`}
            role="tab"
            aria-selected={active === locale}
            aria-controls={`translation-panel-${tabsId}-${locale}`}
            className={cn(
              'relative px-3 py-2 text-sm font-medium',
              'transition-colors duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
              'motion-reduce:transition-none',
              active === locale ? 'text-brand' : 'text-ink-secondary hover:text-ink',
            )}
            onClick={() => {
              selectLocale(locale);
            }}
          >
            {t(locale)}
            {locale === 'hy' ? (
              <span className="ml-1 text-danger" aria-hidden>
                *
              </span>
            ) : null}
          </button>
        ))}
      </div>
      {TRANSLATION_LOCALES.map((locale) => {
        const isActive = locale === active;
        return (
          <div
            key={locale}
            id={`translation-panel-${tabsId}-${locale}`}
            role="tabpanel"
            aria-labelledby={`translation-tab-${tabsId}-${locale}`}
            hidden={!isActive}
            className={cn(
              isActive && 'animate-[page-enter_var(--duration-base)_var(--ease-out-premium)_both]',
              'motion-reduce:animate-none',
            )}
          >
            {children(locale, { isActive })}
          </div>
        );
      })}
    </div>
  );
};
