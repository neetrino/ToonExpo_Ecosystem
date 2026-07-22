'use client';

import type { BuyerQrScanHistoryItem } from '@toonexpo/contracts';
import { Building2, History } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { AccountEmptyState } from '@/features/buyer/components/account/account-empty-state';
import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { Card } from '@/shared/ui/card';
import { Reveal } from '@/shared/ui/motion/reveal';

type ScanHistoryListProps = {
  items: BuyerQrScanHistoryItem[];
};

/**
 * Buyer-facing QR scan history (company name + time, no employee identity).
 */
export const ScanHistoryList = ({ items }: ScanHistoryListProps) => {
  const t = useTranslations('Profile.qr');
  const locale = useLocale();

  if (items.length === 0) {
    return (
      <AccountEmptyState
        icon={History}
        title={t('scans.emptyTitle')}
        description={t('scans.empty')}
      />
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item, index) => (
        <Reveal key={item.id} delayMs={Math.min(index, 6) * 40} as="li">
          <Card variant="elevated" padding="sm" className="flex items-start gap-3">
            <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-sm bg-brand-soft text-brand">
              <Building2 className="size-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">
                {item.scannerCompanyName ?? t('scans.unknownCompany')}
              </p>
              <p className="mt-0.5 text-xs text-ink-muted">
                {formatBuyerDateTime(item.createdAt, locale)}
              </p>
              <p className="mt-1 text-xs font-medium text-ink-secondary">
                {t(`scans.context.${item.scanContext}`)}
              </p>
            </div>
          </Card>
        </Reveal>
      ))}
    </ul>
  );
};
