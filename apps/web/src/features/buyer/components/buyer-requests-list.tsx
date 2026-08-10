'use client';

import { Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { AccountEmptyState } from '@/features/buyer/components/account/account-empty-state';
import { BuyerRequestCard } from '@/features/buyer/components/buyer-request-card';
import { useBuyerRequestsQuery } from '@/features/buyer/hooks/use-buyer';
import { Link } from '@/i18n/navigation';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/ui/cn';

/**
 * Buyer request / interest history list with empty catalog CTA.
 */
export const BuyerRequestsList = () => {
  const t = useTranslations('Profile.requests');
  const query = useBuyerRequestsQuery(1);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
        <Skeleton className="h-72 w-full rounded-[24px]" />
        <Skeleton className="h-72 w-full rounded-[24px]" />
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

  const items = query.data?.data ?? [];

  if (items.length === 0) {
    return (
      <AccountEmptyState
        icon={Inbox}
        title={t('emptyTitle')}
        description={t('empty')}
        action={
          <Link
            href="/projects"
            className={cn(
              'inline-flex h-9 items-center justify-center rounded-sm bg-brand-soft px-4',
              'text-sm font-medium text-brand transition-colors hover:bg-brand/15',
            )}
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
        <Reveal key={item.requestId} delayMs={Math.min(index, 8) * 40} as="li" className="h-full">
          <BuyerRequestCard item={item} />
        </Reveal>
      ))}
    </ul>
  );
};
