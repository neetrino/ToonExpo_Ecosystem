'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations, type Locale } from 'next-intl';
import { useParams, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useId, useOptimistic, useRef, useState, useTransition } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/shared/ui/cn';

/** Figma header trigger — uppercase 2-letter codes (`EN`). */
const LOCALE_CODE: Record<string, string> = {
  hy: 'HY',
  ru: 'RU',
  en: 'EN',
};

const LOCALE_FULL: Record<string, string> = {
  hy: 'Հայերեն',
  ru: 'Русский',
  en: 'English',
};

/** Keeps the menu open while the pointer moves from trigger to panel. */
const HOVER_CLOSE_DELAY_MS = 120;

type LocaleSwitcherProps = {
  /** Visual tone for light surfaces vs dark chrome (footer / hero). */
  tone?: 'light' | 'dark' | undefined;
};

/**
 * Compact language control — Figma header: plain `EN` + chevron (no pill).
 * Opens on hover (desktop); click still toggles for touch / keyboard.
 * Menu stays `absolute` under the trigger so it inherits desktop `zoom`
 * (Safari-safe — no body portal + getBoundingClientRect).
 * Wrapped in Suspense for `useSearchParams` during static prerender.
 */
export const LocaleSwitcher = (props: LocaleSwitcherProps) => (
  <Suspense fallback={<LocaleSwitcherFallback tone={props.tone} />}>
    <LocaleSwitcherInner {...props} />
  </Suspense>
);

const LocaleSwitcherFallback = ({ tone = 'light' }: LocaleSwitcherProps) => {
  const locale = useLocale();
  const isDark = tone === 'dark';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-sm font-medium leading-5',
        isDark ? 'text-on-dark' : 'text-brand-deep',
      )}
      aria-hidden
    >
      <span>{LOCALE_CODE[locale] ?? locale.toUpperCase()}</span>
      <ChevronDown className="size-3.5 shrink-0 opacity-80" />
    </span>
  );
};

const LocaleSwitcherInner = ({ tone = 'light' }: LocaleSwitcherProps) => {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const pathname = usePathname();
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticLocale, setOptimisticLocale] = useOptimistic(locale);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const listId = useId();
  const isDark = tone === 'dark';
  const displayLocale = optimisticLocale;

  const clearCloseTimer = (): void => {
    if (closeTimerRef.current == null) {
      return;
    }
    clearTimeout(closeTimerRef.current);
    closeTimerRef.current = null;
  };

  const openMenu = (): void => {
    clearCloseTimer();
    setOpen(true);
  };

  const scheduleCloseMenu = (): void => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
      closeTimerRef.current = null;
    }, HOVER_CLOSE_DELAY_MS);
  };

  useEffect(() => {
    setOpen(false);
    clearCloseTimer();
  }, [pathname, locale]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || menuRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const switchLocale = (nextLocale: string): void => {
    if (nextLocale === locale || isPending) {
      setOpen(false);
      return;
    }

    setOpen(false);
    const query = Object.fromEntries(searchParams.entries());

    startTransition(() => {
      setOptimisticLocale(nextLocale);
      router.replace(
        // Params always match the active route; next-intl resolves the localized href.
        { pathname, params, query } as never,
        { locale: nextLocale as Locale, scroll: false },
      );
    });
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={openMenu}
      onMouseLeave={scheduleCloseMenu}
    >
      <button
        type="button"
        className={cn(
          'inline-flex items-center gap-1 text-sm font-medium leading-5',
          'transition-colors duration-[var(--duration-fast)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
          isDark
            ? 'text-on-dark hover:text-on-dark/90'
            : 'text-brand-deep hover:text-brand-deep/90',
        )}
        aria-label={t('languageLabel')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-busy={isPending}
        disabled={isPending}
        onClick={() => {
          // Hover/focus may already open the menu; a following click must not
          // toggle it closed (Playwright and real pointer users both hit this).
          clearCloseTimer();
          setOpen(true);
        }}
        onFocus={openMenu}
      >
        <span>{LOCALE_CODE[displayLocale] ?? displayLocale.toUpperCase()}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 opacity-80 transition-transform duration-[var(--duration-fast)]',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          ref={menuRef}
          id={listId}
          role="listbox"
          aria-label={t('languageLabel')}
          className={cn(
            'absolute top-[calc(100%+8px)] right-0 z-[var(--z-dropdown)] w-max overflow-hidden',
            'rounded-[12px] border border-header-border bg-surface-elevated py-1.5 text-ink shadow-md',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
          )}
        >
          {routing.locales.map((code) => {
            const active = code === displayLocale;
            return (
              <li key={code} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={active}
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-sm whitespace-nowrap',
                    'transition-colors duration-[var(--duration-fast)]',
                    active
                      ? 'bg-brand-soft font-semibold text-brand-deep'
                      : 'font-medium text-ink hover:bg-surface',
                  )}
                  onClick={() => switchLocale(code)}
                >
                  <span>{LOCALE_FULL[code] ?? code}</span>
                  {active ? (
                    <Check className="size-3.5 shrink-0 text-brand-logo" aria-hidden />
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
