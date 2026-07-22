'use client';

import type { BuyerFacingRequestStatus, BuyerRequestListItem } from '@toonexpo/contracts';
import { Inbox } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AccountEmptyState } from '@/features/buyer/components/account/account-empty-state';
import {
  AccountStatusBadge,
  getRequestStatusTone,
} from '@/features/buyer/components/account/account-status-badge';
import { useBuyerRequestsQuery } from '@/features/buyer/hooks/use-buyer';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { Link } from '@/i18n/navigation';
import { Card } from '@/shared/ui/card';
import { Reveal } from '@/shared/ui/motion/reveal';
import { Skeleton } from '@/shared/ui/skeleton';
import { cn } from '@/shared/ui/cn';

const statusKey = (status: BuyerFacingRequestStatus): `status.${BuyerFacingRequestStatus}` =>
  `status.${status}`;

type RequestRowProps = {
  item: BuyerRequestListItem;
};

const RequestRow = ({ item }: RequestRowProps) => {
  const t = useTranslations('Profile.requests');
  const locale = useLocale();
  const title = item.projectName ?? item.builderCompanyName;

  return (
    <Card variant="elevated" padding="sm" className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink">{title}</p>
          <p className="mt-0.5 text-xs text-ink-secondary">{item.builderCompanyName}</p>
        </div>
        <AccountStatusBadge
          label={t(statusKey(item.buyerStatus))}
          tone={getRequestStatusTone(item.buyerStatus)}
        />
      </div>

      <dl className="grid gap-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t('createdLabel')}
          </dt>
          <dd className="mt-0.5 text-ink-secondary">
            {formatBuyerDateTime(item.createdAt, locale)}
          </dd>
        </div>
        <div>
          <dt className="text-[10px] font-bold uppercase tracking-widest text-ink-muted">
            {t('updatedLabel')}
          </dt>
          <dd className="mt-0.5 text-ink-secondary">
            {formatBuyerDateTime(item.updatedAt, locale)}
          </dd>
        </div>
      </dl>

      {item.apartmentId ? (
        <p className="text-xs font-medium text-ink-muted">{t('apartmentLinked')}</p>
      ) : null}
      {item.note ? (
        <p className="line-clamp-2 text-xs leading-relaxed text-ink-secondary">{item.note}</p>
      ) : null}
    </Card>
  );
};

/**
 * Buyer request / interest history list with empty catalog CTA.
 */
export const BuyerRequestsList = () => {
  const t = useTranslations('Profile.requests');
  const query = useBuyerRequestsQuery(1);

  if (query.isLoading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-28 w-full" />
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
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <Reveal key={item.requestId} delayMs={Math.min(index, 8) * 40} as="li">
          <RequestRow item={item} />
        </Reveal>
      ))}
    </ul>
  );
};
