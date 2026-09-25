'use client';

import { useLocale, useTranslations, type Locale } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useOptimistic, useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { usePanelLocale } from '@/shared/i18n/panel-intl-client-provider';
import { buildPanelLocaleCookie } from '@/shared/i18n/panel-locale';
import { cn } from '@/shared/ui/cn';
import { LocaleFlag } from '@/shared/ui/locale-flag';
import type { SupportedLocale } from '@toonexpo/shared';

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
  /**
   * `site` — changes the URL locale (public site language).
   * `panel` — sets the portal UI language cookie without changing the site URL locale.
   */
  mode?: 'site' | 'panel' | undefined;
  /** Compact control for dense settings layouts. */
  size?: 'md' | 'sm' | undefined;
};

/**
 * Inline language switcher (EN / RU / HY) for mobile burger menus and settings.
 */
export const LocaleSegmentSwitcher = (props: LocaleSegmentSwitcherProps) => (
  <Suspense
    fallback={
      <LocaleSegmentSwitcherFallback
        className={props.className}
        size={props.size}
        mode={props.mode}
      />
    }
  >
    <LocaleSegmentSwitcherInner {...props} />
  </Suspense>
);

const segmentShellClass = (size: 'md' | 'sm'): string =>
  size === 'sm'
    ? 'flex w-fit items-center gap-0.5 rounded-full bg-surface p-0.5 ring-1 ring-header-border'
    : 'flex w-full items-center gap-0.5 rounded-full bg-surface p-0.5 ring-1 ring-header-border';

const segmentButtonClass = (size: 'md' | 'sm', active: boolean): string =>
  cn(
    size === 'sm'
      ? 'flex h-7 min-w-9 items-center justify-center gap-1 rounded-full px-2 text-xs'
      : 'flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full text-sm',
    'transition-colors duration-[var(--duration-fast)]',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
    'disabled:opacity-60',
    active
      ? 'bg-surface-elevated font-semibold text-brand-deep shadow-xs'
      : 'font-medium text-ink-muted hover:text-ink',
  );

const resolveUrlLocale = (params: ReturnType<typeof useParams>, fallback: string): string => {
  const value = params['locale'];
  return typeof value === 'string' ? value : fallback;
};

const LocaleSegmentSwitcherFallback = ({
  className,
  size = 'md',
  mode = 'site',
}: Pick<LocaleSegmentSwitcherProps, 'className' | 'size' | 'mode'>) => {
  const uiLocale = useLocale();
  const panelLocale = usePanelLocale();
  const params = useParams();
  const t = useTranslations('HomePage');
  const activeLocale =
    mode === 'panel' ? (panelLocale ?? uiLocale) : resolveUrlLocale(params, uiLocale);

  return (
    <div
      role="group"
      aria-label={t('languageLabel')}
      aria-hidden
      className={cn(segmentShellClass(size), className)}
    >
      {routing.locales.map((code) => {
        const active = code === activeLocale;
        return (
          <span key={code} className={segmentButtonClass(size, active)}>
            <LocaleFlag locale={code} />
            {LOCALE_CODE[code] ?? code.toUpperCase()}
          </span>
        );
      })}
    </div>
  );
};

const LocaleSegmentSwitcherInner = ({
  className,
  onLocaleChange,
  mode = 'site',
  size = 'md',
}: LocaleSegmentSwitcherProps) => {
  const t = useTranslations('HomePage');
  const uiLocale = useLocale();
  const panelLocale = usePanelLocale();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const urlLocale = resolveUrlLocale(params, uiLocale);
  /** Site mode tracks URL locale; panel mode tracks panel cookie locale. */
  const currentLocale = mode === 'panel' ? (panelLocale ?? uiLocale) : urlLocale;
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(currentLocale);
  const displayLocale = optimisticLocale;

  const switchLocale = (nextLocale: string): void => {
    if (nextLocale === currentLocale || isPending) {
      onLocaleChange?.();
      return;
    }

    onLocaleChange?.();

    if (mode === 'panel') {
      document.cookie = buildPanelLocaleCookie(nextLocale as SupportedLocale);
      startTransition(() => {
        setOptimisticLocale(nextLocale);
        router.refresh();
      });
      return;
    }

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
      className={cn(segmentShellClass(size), className)}
    >
      {routing.locales.map((code) => {
        const active = code === displayLocale;
        return (
          <button
            key={code}
            type="button"
            aria-pressed={active}
            disabled={isPending}
            className={segmentButtonClass(size, active)}
            onClick={() => switchLocale(code)}
          >
            <LocaleFlag locale={code} />
            {LOCALE_CODE[code] ?? code.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
};
