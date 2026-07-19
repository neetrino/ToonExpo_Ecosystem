'use client';

import type { AdminBosProvisioningListItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { BosProvisioningStatusBadge } from '@/features/admin/components/bos-provisioning-status-badge';
import { Link } from '@/i18n/navigation';

type BosProvisioningTableProps = {
  requests: AdminBosProvisioningListItem[];
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
 * Dense BOS provisioning requests table for platform admin.
 */
export const BosProvisioningTable = ({ requests }: BosProvisioningTableProps) => {
  const t = useTranslations('Admin.bos');
  const locale = useLocale();

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
