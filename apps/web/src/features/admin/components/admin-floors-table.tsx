'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AdminFloorCard } from '@/features/admin/components/admin-floor-card';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminFloorsTableProps = {
  floors: AdminFloorListItem[];
  onSelectFloor: (floor: AdminFloorListItem) => void;
  viewMode?: ViewMode | undefined;
};

/**
 * Admin floors collection as cards or table.
 */
export const AdminFloorsTable = ({
  floors,
  onSelectFloor,
  viewMode = VIEW_MODE_CARDS,
}: AdminFloorsTableProps) => {
  const t = useTranslations('Admin.floors');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {floors.map((floor) => (
          <AdminFloorCard key={floor.id} floor={floor} onSelect={onSelectFloor} />
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
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.building')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.company')}</th>
            <th className="px-3 py-2.5 text-left font-medium">{t('columns.project')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
            <th className="px-3 py-2.5 text-center font-medium">{t('columns.apartments')}</th>
          </tr>
        </thead>
        <tbody>
          {floors.map((floor) => {
            const label =
              floor.displayLabel?.trim() ||
              floor.name?.trim() ||
              t('floorNumber', { number: floor.number });

            return (
              <tr key={floor.id} className="border-t border-border hover:bg-surface/60">
                <td className="px-3 py-2.5 align-middle">
                  <button
                    type="button"
                    className="font-medium text-brand hover:underline"
                    onClick={() => {
                      onSelectFloor(floor);
                    }}
                  >
                    {label}
                  </button>
                </td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">
                  {floor.buildingName}
                </td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">{floor.companyName}</td>
                <td className="px-3 py-2.5 align-middle text-ink-secondary">{floor.projectName}</td>
                <td className="px-3 py-2.5 text-center align-middle">
                  <PublicationStatusBadge
                    status={floor.publicationStatus}
                    className={LIST_STATUS_BADGE_COMPACT_CLASS}
                  />
                </td>
                <td className="px-3 py-2.5 text-center align-middle text-ink-secondary">
                  {floor.apartmentsCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
