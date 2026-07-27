'use client';

import { useLocale, useTranslations, type Locale } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useOptimistic, useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/shared/ui/cn';

/** Uppercase 2-letter codes — matches header LocaleSwitcher. */
const LOCALE_CODE: Record<string, string> = {
  hy: 'HY',
  ru: 'RU',
  en: 'EN',
};

type LocaleSegmentSwitcherProps = {
  className?: string | undefined;
  /** Called after a locale option is chosen (e.g. close mobile drawer). */
  onLocaleChange?: (() => void) | undefined;
};

/**
 * Inline language switcher (EN / RU / HY) for mobile burger menus.
 */
export const LocaleSegmentSwitcher = (props: LocaleSegmentSwitcherProps) => (
  <Suspense fallback={<LocaleSegmentSwitcherFallback className={props.className} />}>
    <LocaleSegmentSwitcherInner {...props} />
  </Suspense>
);

const LocaleSegmentSwitcherFallback = ({ className }: { className?: string | undefined }) => {
  const locale = useLocale();
  const t = useTranslations('HomePage');

  return (
    <div
      role="group"
      aria-label={t('languageLabel')}
      aria-hidden
      className={cn(
        'flex w-full items-center gap-0.5 rounded-full bg-surface p-0.5 ring-1 ring-header-border',
        className,
      )}
    >
      {routing.locales.map((code) => {
        const active = code === locale;
        return (
          <span
            key={code}
            className={cn(
              'flex h-9 flex-1 items-center justify-center rounded-full text-sm font-medium',
              active
                ? 'bg-surface-elevated font-semibold text-brand-deep shadow-xs'
                : 'text-ink-muted',
            )}
          >
            {LOCALE_CODE[code] ?? code.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

const LocaleSegmentSwitcherInner = ({ className, onLocaleChange }: LocaleSegmentSwitcherProps) => {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(locale);
  const displayLocale = optimisticLocale;

  const switchLocale = (nextLocale: string): void => {
    if (nextLocale === locale || isPending) {
      onLocaleChange?.();
      return;
    }

    onLocaleChange?.();
    const query = Object.fromEntries(searchParams.entries());

    startTransition(() => {
      setOptimisticLocale(nextLocale);
      router.replace({ pathname, params, query } as never, {
        locale: nextLocale as Locale,
        scroll: false,
      });
    });
  };

  return (
    <div
      role="group"
      aria-label={t('languageLabel')}
      aria-busy={isPending}
      className={cn(
        'flex w-full items-center gap-0.5 rounded-full bg-surface p-0.5 ring-1 ring-header-border',
        className,
      )}
    >
      {routing.locales.map((code) => {
        const active = code === displayLocale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            disabled={isPending}
            className={cn(
              'flex h-9 flex-1 items-center justify-center rounded-full text-sm',
              'transition-colors duration-[var(--duration-fast)]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
              'disabled:opacity-60',
              active
                ? 'bg-surface-elevated font-semibold text-brand-deep shadow-xs'
                : 'font-medium text-ink-muted hover:text-ink',
            )}
            onClick={() => switchLocale(code)}
          >
            {LOCALE_CODE[code] ?? code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
