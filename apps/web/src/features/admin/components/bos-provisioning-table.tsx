'use client';

import type { AdminBosProvisioningListItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { BosProvisioningStatusBadge } from '@/features/admin/components/bos-provisioning-status-badge';
import { Link } from '@/i18n/navigation';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type BosProvisioningTableProps = {
  requests: AdminBosProvisioningListItem[];
  viewMode?: ViewMode | undefined;
};

const formatDateTime = (iso: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 16);
  }
};

/**
 * BOS provisioning collection as table or card grid for platform admin.
 */
export const BosProvisioningTable = ({
  requests,
  viewMode = 'list',
}: BosProvisioningTableProps) => {
  const t = useTranslations('Admin.bos');
  const locale = useLocale();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {requests.map((item) => (
          <Link
            key={item.id}
            href={`/admin/integrations/bos/${item.id}`}
            className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3 transition-colors hover:bg-surface/60"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <span className="font-medium text-ink">{item.companyName}</span>
              <BosProvisioningStatusBadge status={item.status} />
            </div>
            <span className="font-mono text-xs text-brand">{item.requestId}</span>
            <div className="flex flex-wrap gap-2 text-xs text-ink-muted">
              <span>{formatDateTime(item.createdAt, locale)}</span>
              {(item.status === 'failed' || item.status === 'partial') && item.errorMessage ? (
                <>
                  <span aria-hidden>·</span>
                  <span className="line-clamp-1 text-danger">{item.errorMessage}</span>
                </>
              ) : null}
            </div>
          </Link>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[56rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('columns.requestId')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.createdAt')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.processedAt')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.error')}</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((item) => (
            <tr key={item.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5">
                <Link
                  href={`/admin/integrations/bos/${item.id}`}
                  className="font-mono text-xs font-medium text-brand hover:underline"
                >
                  {item.requestId}
                </Link>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex flex-col gap-0.5">
                  <span className="font-medium text-ink">{item.companyName}</span>
                  <span className="font-mono text-xs text-ink-muted">{item.bosCompanyId}</span>
                </div>
              </td>
              <td className="px-3 py-2.5">
                <BosProvisioningStatusBadge status={item.status} />
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {formatDateTime(item.createdAt, locale)}
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {formatDateTime(item.updatedAt, locale)}
              </td>
              <td className="max-w-xs px-3 py-2.5 text-ink-secondary">
                {item.status === 'failed' || item.status === 'partial'
                  ? (item.errorMessage ?? '—')
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
