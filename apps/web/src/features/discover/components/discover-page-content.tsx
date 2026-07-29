'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';

import { DiscoverSwipeDeck } from '@/features/discover/components/discover-swipe-deck';
import { useDiscoverApartmentsQuery } from '@/features/discover/hooks/use-discover-apartments-query';
import { lockBodyScroll, unlockBodyScroll } from '@/shared/ui/body-scroll-lock';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Mobile discover / Tinder-style apartment swipe surface.
 * Fills the parent viewport strip between top and bottom nav; page scroll locked.
 */
export const DiscoverPageContent = () => {
  const t = useTranslations('Discover');
  const apartmentsQuery = useDiscoverApartmentsQuery();

  useEffect(() => {
    lockBodyScroll();
    return () => {
      unlockBodyScroll();
    };
  }, []);

  if (apartmentsQuery.isLoading) {
    return (
      <main className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col overflow-hidden overscroll-none px-[var(--page-gutter)] py-3">
        <Skeleton className="min-h-0 w-full flex-1 rounded-[28px]" />
      </main>
    );
  }

  if (apartmentsQuery.isError) {
    return (
      <main className="mx-auto flex h-full w-full max-w-md flex-1 flex-col items-center justify-center gap-3 overflow-hidden overscroll-none px-[var(--page-gutter)] text-center">
        <p role="alert" className="text-sm text-danger">
          {t('error')}
        </p>
      </main>
    );
  }

  const apartments = apartmentsQuery.data ?? [];

  if (apartments.length === 0) {
    return (
      <main className="mx-auto flex h-full w-full max-w-md flex-1 flex-col items-center justify-center gap-3 overflow-hidden overscroll-none px-[var(--page-gutter)] text-center">
        <h1 className="font-brand text-2xl font-bold text-ink">{t('empty.title')}</h1>
        <p className="text-sm text-ink-secondary">{t('empty.none')}</p>
      </main>
    );
  }

  return (
    <main className="mx-auto flex h-full min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden overscroll-none px-[var(--page-gutter)] py-3">
      <DiscoverSwipeDeck apartments={apartments} />
    </main>
  );
};
