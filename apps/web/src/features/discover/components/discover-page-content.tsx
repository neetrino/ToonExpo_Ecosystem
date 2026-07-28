'use client';

import { Heart } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Placeholder for the project swipe / discover experience (buyer bottom nav).
 */
export const DiscoverPageContent = () => {
  const t = useTranslations('Discover');

  return (
    <main className="mx-auto flex w-full max-w-md flex-col items-center gap-4 px-[var(--page-gutter)] py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Heart className="size-7" strokeWidth={1.75} aria-hidden />
      </span>
      <h1 className="font-brand text-3xl font-bold tracking-tight text-ink">{t('title')}</h1>
      <p className="text-sm text-ink-secondary">{t('subtitle')}</p>
    </main>
  );
};
