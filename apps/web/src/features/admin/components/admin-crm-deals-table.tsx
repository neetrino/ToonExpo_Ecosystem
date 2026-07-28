'use client';

import type { CrmDealListItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { formatBuyerDateTime } from '@/features/buyer/utils/format-datetime';
import { CrmDealPipeline } from '@/features/crm-board/crm-deal-pipeline';

type AdminCrmDealsTableProps = {
  deals: CrmDealListItem[];
  onSelectDeal: (dealId: string) => void;
};

const dealLabel = (deal: CrmDealListItem, unnamed: string): string =>
  deal.buyer.name?.trim() || deal.buyer.phone?.trim() || deal.buyer.email?.trim() || unnamed;

/**
 * Admin CRM deals dense table (list companion to Kanban cards view).
 */
export const AdminCrmDealsTable = ({ deals, onSelectDeal }: AdminCrmDealsTableProps) => {
  const t = useTranslations('Admin.crm');
  const tBoard = useTranslations('CrmBoard');
  const locale = useLocale();

  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2 text-left font-medium">{t('columns.buyer')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.company')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.project')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.status')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.source')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.assignee')}</th>
              <th className="px-3 py-2 text-center font-medium">{t('columns.updated')}</th>
            </tr>
          </thead>
          <tbody>
            {deals.map((deal) => (
              <tr
                key={deal.id}
                tabIndex={0}
                className="cursor-pointer border-t border-border hover:bg-surface/60 focus-visible:bg-surface/60 focus-visible:outline-none"
                onClick={() => {
                  onSelectDeal(deal.id);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelectDeal(deal.id);
                  }
                }}
              >
                <td className="px-3 py-2.5 text-left">
                  <span className="font-medium text-brand">
                    {dealLabel(deal, tBoard('unnamedBuyer'))}
                  </span>
                  {deal.buyer.phone ? (
                    <p className="mt-0.5 text-xs text-ink-muted">{deal.buyer.phone}</p>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-center text-ink-secondary">
                  {deal.companyName ?? '—'}
                </td>
                <td className="px-3 py-2.5 text-center text-ink-secondary">
                  {deal.projectName ?? tBoard('noProject')}
                </td>
                <td className="px-3 py-2.5 text-center">
                  <div className="flex justify-center">
                    <CrmDealPipeline status={deal.status} />
                  </div>
                </td>
                <td className="px-3 py-2.5 text-center text-ink-secondary">
                  {tBoard(`sources.${deal.source}`)}
                </td>
                <td className="px-3 py-2.5 text-center text-ink-secondary">
                  {deal.assignedUserName ?? tBoard('unassigned')}
                </td>
                <td className="px-3 py-2.5 text-center text-ink-muted">
                  {formatBuyerDateTime(deal.updatedAt, locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
