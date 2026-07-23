'use client';

import { useTranslations } from 'next-intl';

import { Link, usePathname } from '@/i18n/navigation';
import { cn } from '@/shared/ui/cn';

type MortgagePrequalifyCtaProps = {
  bankName: string;
};

/**
 * Soft pre-qualify strip under offers — Figma `105:2650`.
 */
export const MortgagePrequalifyCta = ({ bankName }: MortgagePrequalifyCtaProps) => {
  const t = useTranslations('Mortgage.prequalify');
  const pathname = usePathname();
  const href = `/auth/register?returnUrl=${encodeURIComponent(pathname)}`;

  return (
    <div className="rounded-[20px] bg-band-mist/40 p-6">
      <h3 className="font-brand text-lg font-bold tracking-tight text-ink-navy">
        {t('title', { bank: bankName })}
      </h3>
      <p className="mt-2 text-sm leading-5 text-header-muted">{t('subtitle')}</p>
      <Link
        href={href}
        className={cn(
          'mt-4 inline-flex h-11 items-center justify-center rounded-2xl px-5',
          'bg-brand-deep text-sm font-semibold text-on-dark',
          'transition-colors hover:bg-brand-deep/90',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-deep/30',
        )}
      >
        {t('cta')}
      </Link>
    </div>
  );
};
