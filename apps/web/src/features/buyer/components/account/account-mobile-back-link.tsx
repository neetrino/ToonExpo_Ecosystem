'use client';

import { ArrowLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

type AccountMobileBackLinkProps = {
  onBack: () => void;
  className?: string | undefined;
};

/**
 * Mobile-only back control — arrow with stem, aligned to page titles.
 */
export const AccountMobileBackLink = ({ onBack, className }: AccountMobileBackLinkProps) => {
  const t = useTranslations('Profile.nav');

  return (
    <button
      type="button"
      onClick={onBack}
      aria-label={t('back')}
      className={cn(
        'group inline-flex size-10 shrink-0 items-center justify-center',
        'text-ink transition-opacity hover:opacity-70',
        className,
      )}
    >
      <ArrowLeft
        className={cn(
          'size-6 shrink-0 transition-transform duration-[var(--duration-fast)]',
          'ease-[var(--ease-out-premium)] group-hover:-translate-x-0.5',
        )}
        strokeWidth={2.25}
        aria-hidden
      />
    </button>
  );
};
