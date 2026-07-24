'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AdminBuildingCard } from '@/features/admin/components/admin-building-card';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminBuildingsTableProps = {
  buildings: AdminBuildingListItem[];
  onSelectBuilding: (buildingId: string) => void;
  viewMode?: ViewMode | undefined;
};

/**
 * Admin buildings collection as cards or table.
 */
export const AdminBuildingsTable = ({
  buildings,
  onSelectBuilding,
  viewMode = VIEW_MODE_CARDS,
}: AdminBuildingsTableProps) => {
  const t = useTranslations('Admin.buildings');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {buildings.map((building) => (
          <AdminBuildingCard key={building.id} building={building} onSelect={onSelectBuilding} />
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-sm border border-border">
      <table className="w-full min-w-[48rem] border-collapse text-sm">
        <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
          <tr>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.project')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.floors')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.apartments')}</th>
          </tr>
        </thead>
        <tbody>
          {buildings.map((building) => (
            <tr key={building.id} className="border-t border-border hover:bg-surface/60">
              <td className="px-3 py-2.5 align-middle">
                <button
                  type="button"
                  className="font-medium text-brand hover:underline"
                  onClick={() => {
                    onSelectBuilding(building.id);
                  }}
                >
                  {building.name}
                </button>
              </td>
              <td className="px-3 py-2.5 align-middle text-ink-secondary">
                {building.companyName}
              </td>
              <td className="px-3 py-2.5 align-middle text-ink-secondary">
                {building.projectName}
              </td>
              <td className="px-3 py-2.5 text-center align-middle">
                <PublicationStatusBadge
                  status={building.publicationStatus}
                  className={LIST_STATUS_BADGE_COMPACT_CLASS}
                />
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                {building.floorsCount}
              </td>
              <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                {building.apartmentsCount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
