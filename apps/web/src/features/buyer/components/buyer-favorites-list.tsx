'use client';

import { FolderHeart, Heart } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AccountEmptyState } from '@/features/buyer/components/account/account-empty-state';
import { FavoriteApartmentCardView } from '@/features/buyer/components/favorite-apartment-card';
import {
  useBuyerFavoritesQuery,
  useRemoveFavoriteMutation,
} from '@/features/buyer/hooks/use-favorites';
import { ProjectCard } from '@/features/catalog/components/project-card';
import { Link } from '@/i18n/navigation';
import { Button } from '@/shared/ui/button';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Skeleton } from '@/shared/ui/skeleton';

/**
 * Buyer favorites list with project cards and compact apartment rows.
 */
export const BuyerFavoritesList = () => {
  const t = useTranslations('Profile.favorites');
  const locale = useLocale();
  const query = useBuyerFavoritesQuery(locale);
  const removeMutation = useRemoveFavoriteMutation();

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

  return (
    <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <Reveal key={item.id} delayMs={Math.min(index, 8) * 40} as="li">
          {item.targetType === 'project' ? (
            <div className="flex h-full flex-col gap-3">
              <ProjectCard project={item.project} />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="self-start text-danger hover:text-danger"
                disabled={removeMutation.isPending}
                onClick={() =>
                  removeMutation.mutate({
                    targetType: 'project',
                    targetId: item.targetId,
                  })
                }
              >
                <Heart className="size-3.5 fill-current" aria-hidden />
                {t('removeButton')}
              </Button>
            </div>
          ) : (
            <FavoriteApartmentCardView
              apartment={item.apartment}
              removing={removeMutation.isPending}
              onRemove={() =>
                removeMutation.mutate({
                  targetType: 'apartment',
                  targetId: item.targetId,
                })
              }
            />
          )}
        </Reveal>
      ))}
    </ul>
  );
};
