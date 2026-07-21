import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { LocaleSwitcher } from '@/shared/ui/locale-switcher';

const AUTH_PANEL_IMAGE = '/demo/northern-avenue.jpg';

type AuthPageShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
  variant: 'login' | 'register';
};

type ShellCopy = {
  eyebrow: string;
  panelTitle: string;
  panelBody: string;
  backHome: string;
};

/**
 * Branded auth layout — cinematic panel + focused form column.
 */
export const AuthPageShell = async ({ title, subtitle, children, variant }: AuthPageShellProps) => {
  const t = await getTranslations('Auth.shell');
  const copy: ShellCopy = {
    eyebrow: t('eyebrow'),
    panelTitle: t('panelTitle'),
    panelBody: variant === 'login' ? t('loginBody') : t('registerBody'),
    backHome: t('backHome'),
  };

  return (
    <div className="relative min-h-svh bg-background lg:grid lg:grid-cols-2">
      <AuthVisualPanel copy={copy} />
      <AuthFormColumn title={title} subtitle={subtitle} backHomeLabel={copy.backHome}>
        {children}
      </AuthFormColumn>
    </div>
  );
};

const AuthVisualPanel = ({ copy }: { copy: ShellCopy }) => {
  return (
    <aside
      className={cn(
        'relative isolate hidden overflow-hidden lg:flex lg:min-h-svh lg:flex-col',
        'lg:justify-between lg:p-10 xl:p-12',
      )}
    >
      <div className="absolute inset-0" aria-hidden>
        <div className="hero-cinematic-frame absolute inset-0">
          <div className="hero-cinematic-media absolute inset-[-10%]">
            <Image
              src={AUTH_PANEL_IMAGE}
              alt=""
              fill
              priority
              className="object-cover object-center"
              sizes="50vw"
            />
          </div>
        </div>
        <div className="hero-cinematic-haze pointer-events-none absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/40" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/25 via-transparent to-accent/15" />
      </div>

      <BrandLogo inverted size="lg" className="relative" />

      <div className="relative max-w-md animate-[page-enter_0.55s_var(--ease-out-premium)_both]">
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="font-display text-[clamp(2rem,3.2vw,2.75rem)] font-semibold leading-[1.05] tracking-[-0.04em] text-on-dark">
          {copy.panelTitle}
        </h2>
        <p className="mt-4 text-base leading-relaxed text-on-dark/80">{copy.panelBody}</p>
      </div>
    </aside>
  );
};

type AuthFormColumnProps = {
  title: string;
  subtitle: string;
  backHomeLabel: string;
  children: ReactNode;
};

const AuthFormColumn = ({ title, subtitle, backHomeLabel, children }: AuthFormColumnProps) => {
  return (
    <div className="relative flex min-h-svh flex-col">
      <div className="pointer-events-none absolute inset-0 opacity-80 lg:hidden" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgb(26_143_152_/_0.14),transparent_55%)]" />
        <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-brand-secondary/10 to-transparent" />
      </div>

      <header className="relative z-[1] flex items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5 lg:justify-end">
        <BrandLogo size="md" className="lg:hidden" />
        <div className="flex items-center gap-3">
          <LocaleSwitcher tone="light" />
          <Link
            href="/"
            className="hidden text-sm font-medium text-ink-secondary transition-colors hover:text-ink sm:inline"
          >
            {backHomeLabel}
          </Link>
        </div>
      </header>

      <main className="relative z-[1] flex flex-1 flex-col justify-center px-5 pb-12 pt-4 sm:px-8 sm:pb-16">
        <div
          className={cn(
            'mx-auto w-full max-w-[26rem]',
            'animate-[page-enter_0.45s_var(--ease-out-premium)_both]',
          )}
        >
          <div className="mb-7 flex flex-col gap-2 text-center sm:mb-8 sm:text-left">
            <h1 className="text-page-title text-ink">{title}</h1>
            <p className="text-sm leading-relaxed text-ink-secondary sm:text-[0.9375rem]">
              {subtitle}
            </p>
          </div>

          <Card
            variant="elevated"
            padding="lg"
            className="border-border/80 shadow-card ring-1 ring-black/5"
          >
            {children}
          </Card>
        </div>
      </main>
    </div>
  );
};
