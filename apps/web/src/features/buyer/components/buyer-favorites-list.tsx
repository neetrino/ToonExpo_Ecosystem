'use client';

import type { FavoriteListItem } from '@toonexpo/contracts';
import { FolderHeart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { AccountEmptyState } from '@/features/buyer/components/account/account-empty-state';
import { FavoriteApartmentCardView } from '@/features/buyer/components/favorite-apartment-card';
import { FavoritesStatusProvider } from '@/features/buyer/components/favorites-status-provider';
import { useBuyerFavoritesQuery } from '@/features/buyer/hooks/use-favorites';
import type { FavoriteTarget } from '@/features/buyer/utils/favorite-target-key';
import { ProjectCard } from '@/features/catalog/components/project-card';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Buyer favorites list with project and apartment marketplace cards.
 * Hearts toggle remove — same control as catalog.
 */
export const BuyerFavoritesList = () => {
  const t = useTranslations('Profile.favorites');
  const locale = useLocale();
  const query = useBuyerFavoritesQuery(locale);

  if (query.isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-live="polite">
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (query.isError) {
    return (
      <p
        role="alert"
        className="rounded-md border border-danger/20 bg-danger-soft px-4 py-3 text-sm text-danger"
      >
        {t('error')}
      </p>
    );
  }

  const items = query.data?.items ?? [];

  if (items.length === 0) {
    return (
      <AccountEmptyState
        icon={FolderHeart}
        title={t('emptyTitle')}
        description={t('empty')}
        action={
          <Link
            href="/projects"
            className="inline-flex h-9 items-center justify-center rounded-sm bg-brand-soft px-4 text-sm font-medium text-brand transition-colors hover:bg-brand/15"
          >
            {t('browseCatalog')}
          </Link>
        }
      />
    );
  }

  return <BuyerFavoritesGrid items={items} />;
};

const BuyerFavoritesGrid = ({ items }: { items: FavoriteListItem[] }) => {
  const targets = useMemo<FavoriteTarget[]>(
    () => items.map((item) => ({ targetType: item.targetType, targetId: item.targetId })),
    [items],
  );

  return (
    <FavoritesStatusProvider targets={targets}>
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item, index) => (
          <Reveal key={item.id} delayMs={Math.min(index, 8) * 40} as="li">
            {item.targetType === 'project' ? (
              <ProjectCard project={item.project} showFavorite />
            ) : (
              <FavoriteApartmentCardView apartment={item.apartment} />
            )}
          </Reveal>
        ))}
      </ul>
    </FavoritesStatusProvider>
  );
};
