import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
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
  formEyebrow: string;
};

/**
 * Branded auth layout — cinematic panel + focused luxury form column.
 */
export const AuthPageShell = async ({ title, subtitle, children, variant }: AuthPageShellProps) => {
  const t = await getTranslations('Auth.shell');
  const copy: ShellCopy = {
    eyebrow: t('eyebrow'),
    panelTitle: t('panelTitle'),
    panelBody: variant === 'login' ? t('loginBody') : t('registerBody'),
    backHome: t('backHome'),
    formEyebrow: variant === 'login' ? t('loginEyebrow') : t('registerEyebrow'),
  };

  return (
    <div className="relative min-h-svh bg-background lg:grid lg:grid-cols-2">
      <AuthVisualPanel copy={copy} />
      <AuthFormColumn
        title={title}
        subtitle={subtitle}
        formEyebrow={copy.formEyebrow}
        backHomeLabel={copy.backHome}
      >
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
        'lg:justify-between lg:p-10 xl:p-14',
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
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-transparent to-accent/20" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/50 to-transparent" />
      </div>

      <BrandLogo inverted size="lg" className="relative" />

      <div className="relative max-w-md animate-[page-enter_0.55s_var(--ease-out-premium)_both]">
        <div className="mb-5 h-px w-12 bg-accent" aria-hidden />
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="font-display text-[clamp(2.15rem,3.4vw,3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-on-dark">
          {copy.panelTitle}
        </h2>
        <p className="mt-5 text-[0.975rem] leading-relaxed text-on-dark/78">{copy.panelBody}</p>
      </div>
    </aside>
  );
};

type AuthFormColumnProps = {
  title: string;
  subtitle: string;
  formEyebrow: string;
  backHomeLabel: string;
  children: ReactNode;
};

const AuthFormColumn = ({
  title,
  subtitle,
  formEyebrow,
  backHomeLabel,
  children,
}: AuthFormColumnProps) => {
  return (
    <div className="relative flex min-h-svh flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_70%_-5%,rgb(184_149_108_/_0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_10%_100%,rgb(26_143_152_/_0.08),transparent_50%)]" />
        <div className="absolute inset-x-8 top-24 hidden h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent lg:block" />
      </div>

      <header className="relative z-[1] flex items-center justify-between gap-3 px-5 py-4 sm:px-8 sm:py-5 lg:justify-end lg:px-12">
        <BrandLogo size="md" className="lg:hidden" />
        <div className="flex items-center gap-3">
          <LocaleSwitcher tone="light" />
          <Link
            href="/"
            className="hidden text-sm font-medium tracking-tight text-ink-secondary transition-colors hover:text-ink sm:inline"
          >
            {backHomeLabel}
          </Link>
        </div>
      </header>

      <main className="relative z-[1] flex flex-1 flex-col justify-center px-5 pb-14 pt-2 sm:px-8 sm:pb-16 lg:px-12">
        <div
          className={cn(
            'mx-auto w-full max-w-[28rem]',
            'animate-[page-enter_0.5s_var(--ease-out-premium)_both]',
          )}
        >
          <div className="mb-8 flex flex-col items-center gap-3 text-center sm:mb-9 sm:items-start sm:text-left">
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              {formEyebrow}
            </p>
            <h1 className="font-display text-[clamp(1.85rem,3.2vw,2.55rem)] font-semibold leading-[1.08] tracking-[-0.04em] text-ink">
              {title}
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-ink-secondary sm:text-[0.95rem]">
              {subtitle}
            </p>
          </div>

          <div
            className={cn(
              'relative overflow-hidden rounded-lg border border-border/50',
              'bg-surface-elevated/90 p-6 shadow-lg backdrop-blur-xl sm:p-8',
              'ring-1 ring-accent/10',
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent"
              aria-hidden
            />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
