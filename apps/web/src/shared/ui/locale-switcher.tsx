'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useId, useRef, useState } from 'react';

import { usePathname, useRouter } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { cn } from '@/shared/ui/cn';

const LOCALE_SHORT: Record<string, string> = {
  hy: 'Հայ',
  ru: 'Рус',
  en: 'Eng',
};

const LOCALE_FULL: Record<string, string> = {
  hy: 'Հայերեն',
  ru: 'Русский',
  en: 'English',
};

type LocaleSwitcherProps = {
  /** Visual tone for light surfaces vs dark chrome (footer / hero). */
  tone?: 'light' | 'dark' | undefined;
};

/**
 * Compact language dropdown — opens below the trigger with full locale names.
 */
export const LocaleSwitcher = ({ tone = 'light' }: LocaleSwitcherProps) => {
  const t = useTranslations('HomePage');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const isDark = tone === 'dark';

  useEffect(() => {
    setOpen(false);
  }, [pathname, locale]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const onPointerDown = (event: MouseEvent): void => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
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

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className={cn(
          'inline-flex h-9 items-center gap-1.5 rounded-sm px-2.5',
          'text-xs font-semibold tracking-wide transition-[border-color,background-color,box-shadow,color]',
          'duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
          isDark
            ? cn(
                'border border-white/25 bg-white/10 text-on-dark hover:border-white/40 hover:bg-white/15',
                open && 'border-white/45 bg-white/15',
              )
            : cn(
                'border border-border/80 bg-surface-elevated/90 text-ink hover:border-brand/35 hover:shadow-xs',
                open && 'border-brand/40 shadow-xs',
              ),
        )}
        aria-label={t('languageLabel')}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{LOCALE_SHORT[locale] ?? locale}</span>
        <ChevronDown
          className={cn(
            'size-3.5 shrink-0 opacity-60 transition-transform duration-[var(--duration-fast)]',
            open && 'rotate-180',
          )}
          aria-hidden
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-label={t('languageLabel')}
          className={cn(
            'absolute top-[calc(100%+0.4rem)] right-0 z-[var(--z-dropdown)] min-w-[11rem] overflow-hidden',
            'rounded-sm border py-1.5 shadow-md',
            'animate-[locale-dropdown-in_var(--duration-base)_var(--ease-out-premium)]',
            isDark
              ? 'border-white/15 bg-surface-inverse text-on-dark'
              : 'border-border/80 bg-surface-elevated text-ink',
          )}
        >
          {routing.locales.map((code) => {
            const active = code === locale;
            return (
              <li key={code} role="option" aria-selected={active}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center justify-between gap-3 px-3.5 py-2.5 text-left text-sm',
                    'transition-colors duration-[var(--duration-fast)]',
                    active
                      ? isDark
                        ? 'bg-white/10 font-semibold text-brand'
                        : 'bg-brand-soft font-semibold text-brand'
                      : isDark
                        ? 'font-medium text-on-dark/85 hover:bg-white/8'
                        : 'font-medium text-ink hover:bg-surface',
                  )}
                  onClick={() => {
                    setOpen(false);
                    if (!active) {
                      router.replace(pathname, { locale: code });
                    }
                  }}
                >
                  <span className="flex flex-col gap-0.5">
                    <span className="leading-none tracking-[-0.01em]">
                      {LOCALE_FULL[code] ?? code}
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-[0.12em]',
                        isDark ? 'text-on-dark/45' : 'text-ink-muted',
                      )}
                    >
                      {LOCALE_SHORT[code] ?? code}
                    </span>
                  </span>
                  {active ? <Check className="size-3.5 shrink-0 text-brand" aria-hidden /> : null}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
