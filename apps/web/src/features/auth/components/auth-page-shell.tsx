import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AuthFitStage } from '@/features/auth/components/auth-fit-stage';
import { Link } from '@/i18n/navigation';
import { BrandLogo } from '@/shared/ui/brand-logo';
import { cn } from '@/shared/ui/cn';

const AUTH_PANEL_IMAGE = '/demo/northern-avenue.webp';

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
 * Branded auth layout — cinematic panel with lightning seam + luxury form column.
 * Form column fits the viewport (scale-to-fit) so login/register do not page-scroll.
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
    <div className="relative h-fluid-screen overflow-hidden bg-background">
      <AuthVisualPanel copy={copy} />
      <AuthFormColumn
        title={title}
        subtitle={subtitle}
        formEyebrow={copy.formEyebrow}
        backHomeLabel={copy.backHome}
        compact={variant === 'register'}
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
        'auth-panel-seam pointer-events-none absolute inset-y-0 left-0 z-10 hidden',
        'w-[52%] flex-col justify-between p-10 xl:w-[53%] xl:p-14',
        'lg:pointer-events-auto lg:flex',
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
              sizes="54vw"
            />
          </div>
        </div>
        <div className="hero-cinematic-haze pointer-events-none absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/35" />
        <div className="absolute inset-0 bg-gradient-to-br from-brand/30 via-transparent to-accent/20" />
        <AuthSeamStroke />
      </div>

      <BrandLogo inverted size="lg" className="relative shrink-0" />

      <div className="relative max-w-md animate-[page-enter_0.55s_var(--ease-out-premium)_both]">
        <div className="mb-5 h-px w-12 bg-accent" aria-hidden />
        <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.32em] text-accent">
          {copy.eyebrow}
        </p>
        <h2 className="font-display text-[clamp(1.75rem,3vw,3rem)] font-semibold leading-[1.02] tracking-[-0.045em] text-on-dark">
          {copy.panelTitle}
        </h2>
        <p className="mt-4 text-[0.9rem] leading-relaxed text-on-dark/78 xl:mt-5 xl:text-[0.975rem]">
          {copy.panelBody}
        </p>
      </div>
    </aside>
  );
};

/** Champagne accent path tracing the jagged seam. */
const AuthSeamStroke = () => {
  return (
    <svg
      className="pointer-events-none absolute inset-0 size-full"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        className="auth-seam-stroke"
        d="M97 0 L99.2 3.5 L96 8 L99.5 13 L95.5 19 L99 25.5 L95 33 L99.6 41 L96 49 L99.2 57 L94.8 66 L98.8 74 L95.5 82 L99.4 90 L96.5 100"
      />
    </svg>
  );
};

type AuthFormColumnProps = {
  title: string;
  subtitle: string;
  formEyebrow: string;
  backHomeLabel: string;
  compact: boolean;
  children: ReactNode;
};

const AuthFormColumn = ({
  title,
  subtitle,
  formEyebrow,
  backHomeLabel,
  compact,
  children,
}: AuthFormColumnProps) => {
  return (
    <div className="relative z-0 flex h-fluid-screen flex-col overflow-hidden lg:pl-[50%]">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_70%_-5%,rgb(184_149_108_/_0.12),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_10%_100%,rgb(26_143_152_/_0.08),transparent_50%)]" />
      </div>

      <header
        className={cn(
          'relative z-[1] flex shrink-0 items-center justify-between gap-3 px-5 lg:justify-end lg:px-12',
          compact ? 'py-3 sm:py-3.5' : 'py-4 sm:py-5',
        )}
      >
        <BrandLogo size="md" className="lg:hidden" />
        <Link
          href="/"
          className={cn(
            'group inline-flex h-9 items-center gap-2 rounded-sm border border-border/80',
            'bg-surface-elevated/90 px-3 text-xs font-semibold tracking-wide text-ink',
            'shadow-xs transition-[border-color,background-color,box-shadow,color,transform]',
            'duration-[var(--duration-fast)] ease-[var(--ease-out-premium)]',
            'hover:border-accent/40 hover:bg-accent-soft/50 hover:text-ink hover:shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/25',
            'active:scale-[0.98]',
          )}
        >
          <ArrowLeft
            className="size-3.5 shrink-0 text-accent transition-transform duration-[var(--duration-fast)] group-hover:-translate-x-0.5"
            aria-hidden
          />
          <span>{backHomeLabel}</span>
        </Link>
      </header>

      <AuthFitStage className="relative z-[1] px-5 pb-4 sm:px-8 lg:px-12">
        <div className="animate-[page-enter_0.5s_var(--ease-out-premium)_both]">
          <div
            className={cn(
              'flex flex-col items-center gap-2 text-center sm:items-start sm:text-left',
              compact ? 'mb-4 sm:mb-5' : 'mb-6 sm:mb-8',
            )}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-accent">
              {formEyebrow}
            </p>
            <h1
              className={cn(
                'font-display font-semibold leading-[1.08] tracking-[-0.04em] text-ink',
                compact
                  ? 'text-[clamp(1.55rem,2.8vw,2.15rem)]'
                  : 'text-[clamp(1.85rem,3.2vw,2.55rem)]',
              )}
            >
              {title}
            </h1>
            <p
              className={cn(
                'max-w-sm leading-relaxed text-ink-secondary',
                compact ? 'text-xs sm:text-sm' : 'text-sm sm:text-[0.95rem]',
              )}
            >
              {subtitle}
            </p>
          </div>

          <div
            className={cn(
              'relative overflow-hidden rounded-lg border border-border/50',
              'bg-surface-elevated/90 backdrop-blur-xl',
              'ring-1 ring-accent/10',
              compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8',
            )}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/45 to-transparent"
              aria-hidden
            />
            {children}
          </div>
        </div>
      </AuthFitStage>
    </div>
  );
};
