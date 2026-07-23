'use client';

import type { CompanyResponse } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { AdminListCardLogo } from '@/shared/ui/admin-list-card-logo';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type CompaniesTableProps = {
  companies: CompanyResponse[];
  onSelectCompany: (companyId: string) => void;
  viewMode?: ViewMode | undefined;
};

const formatDate = (iso: string, locale: string): string => {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
};

/**
 * Companies collection as dense table or card grid for platform admin.
 */
export const CompaniesTable = ({
  companies,
  onSelectCompany,
  viewMode = VIEW_MODE_CARDS,
}: CompaniesTableProps) => {
  const t = useTranslations('Admin.companies');
  const locale = useLocale();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {companies.map((company) => (
          <button
            key={company.id}
            type="button"
            className="flex items-stretch gap-3 rounded-sm border border-border bg-background p-3 text-left transition-colors hover:bg-surface/60"
            onClick={() => onSelectCompany(company.id)}
          >
            <AdminListCardLogo name={company.name} logoUrl={company.logoUrl} size="match" />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5">
              <span className="truncate font-medium text-ink">{company.name}</span>
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                <span>{t(`types.${company.type}`)}</span>
                <span aria-hidden>·</span>
                <span>{t(`statuses.${company.status}`)}</span>
                <span aria-hidden>·</span>
                <span>{formatDate(company.createdAt, locale)}</span>
              </div>
            </div>
          </button>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 font-medium">{t('columns.name')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.type')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2 font-medium">{t('columns.createdAt')}</th>
          </tr>
        </thead>
        <tbody>
          {companies.map((company) => (
            <tr key={company.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5">
                <div className="flex items-center gap-3">
                  <AdminListCardLogo name={company.name} logoUrl={company.logoUrl} shape="circle" />
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => onSelectCompany(company.id)}
                  >
                    {company.name}
                  </button>
                </div>
              </td>
              <td className="px-3 py-2.5 text-ink-secondary">{t(`types.${company.type}`)}</td>
              <td className="px-3 py-2.5 text-ink-secondary">{t(`statuses.${company.status}`)}</td>
              <td className="px-3 py-2.5 text-ink-secondary">
                {formatDate(company.createdAt, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
