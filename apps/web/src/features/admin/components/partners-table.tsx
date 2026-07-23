'use client';

import type { AdminPartnerListItem } from '@toonexpo/contracts';
import { useLocale, useTranslations } from 'next-intl';

import {
  FeaturedBadge,
  PartnerStatusBadge,
  PublicationStatusBadge,
} from '@/features/partners/components/partner-badges';
import { PartnerTypeLabel } from '@/features/partners/components/partner-type-label';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type PartnersTableProps = {
  partners: AdminPartnerListItem[];
  onSelectPartner: (partnerId: string) => void;
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
 * Partners collection as dense table or card grid for platform admin.
 */
export const PartnersTable = ({
  partners,
  onSelectPartner,
  viewMode = 'list',
}: PartnersTableProps) => {
  const t = useTranslations('Admin.partners');
  const locale = useLocale();

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid>
        {partners.map((partner) => (
          <button
            key={partner.id}
            type="button"
            className="flex flex-col gap-2 rounded-sm border border-border bg-background p-3 text-left transition-colors hover:bg-surface/60"
            onClick={() => onSelectPartner(partner.id)}
          >
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-medium text-ink">{partner.name}</span>
              <FeaturedBadge featured={partner.featured} />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <PartnerTypeLabel type={partner.type} />
              <PartnerStatusBadge status={partner.status} />
              <PublicationStatusBadge status={partner.publicationStatus} />
            </div>
            <p className="text-xs text-ink-muted">{formatDate(partner.updatedAt, locale)}</p>
          </button>
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-left text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2 text-left font-medium">{t('columns.name')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.type')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.publication')}</th>
            <th className="px-3 py-2 text-center font-medium">{t('columns.updatedAt')}</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((partner) => (
            <tr key={partner.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5 text-left">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => onSelectPartner(partner.id)}
                  >
                    {partner.name}
                  </button>
                  <FeaturedBadge featured={partner.featured} />
                </div>
              </td>
              <td className="px-3 py-2.5 text-center text-ink-secondary">
                <PartnerTypeLabel type={partner.type} />
              </td>
              <td className="px-3 py-2.5">
                <div className="flex justify-center">
                  <PartnerStatusBadge status={partner.status} />
                </div>
              </td>
              <td className="px-3 py-2.5">
                <div className="flex justify-center">
                  <PublicationStatusBadge status={partner.publicationStatus} />
                </div>
              </td>
              <td className="px-3 py-2.5 text-center text-ink-secondary">
                {formatDate(partner.updatedAt, locale)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
