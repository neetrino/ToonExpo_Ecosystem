'use client';

import { useTranslations } from 'next-intl';
import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

import { TRANSLATION_LOCALES } from '@/features/builder/constants';
import { cn } from '@/shared/ui/cn';

type TranslationLocale = (typeof TRANSLATION_LOCALES)[number];

type TranslationTabsProps = {
  children: (locale: TranslationLocale) => ReactNode;
};

type IndicatorMetrics = {
  left: number;
  width: number;
};

/**
 * hy / ru / en tab switcher with a sliding underline and soft panel fade.
 */
export const TranslationTabs = ({ children }: TranslationTabsProps) => {
  const t = useTranslations('Builder.locales');
  const [active, setActive] = useState<TranslationLocale>('hy');
  const [panelKey, setPanelKey] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Partial<Record<TranslationLocale, HTMLButtonElement | null>>>({});
  const [indicator, setIndicator] = useState<IndicatorMetrics>({ left: 0, width: 0 });

  useLayoutEffect(() => {
    const updateIndicator = (): void => {
      const list = listRef.current;
      const tab = tabRefs.current[active];
      if (!list || !tab) {
        return;
      }
      const listBox = list.getBoundingClientRect();
      const tabBox = tab.getBoundingClientRect();
      setIndicator({
        left: tabBox.left - listBox.left + list.scrollLeft,
        width: tabBox.width,
      });
    };

    updateIndicator();
    window.addEventListener('resize', updateIndicator);
    return () => {
      window.removeEventListener('resize', updateIndicator);
    };
  }, [active]);

  const selectLocale = (locale: TranslationLocale): void => {
    if (locale === active) {
      return;
    }
    setActive(locale);
    setPanelKey((key) => key + 1);
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
            'pointer-events-none absolute bottom-0 h-0.5 rounded-full bg-brand',
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
            role="tab"
            aria-selected={active === locale}
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
      <div
        key={panelKey}
        role="tabpanel"
        className={cn(
          'animate-[page-enter_var(--duration-base)_var(--ease-out-premium)_both]',
          'motion-reduce:animate-none',
        )}
      >
        {children(active)}
      </div>
    </div>
  );
};
