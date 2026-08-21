'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { AdminBuildingCard } from '@/features/admin/components/admin-building-card';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { AdminListCardGrid } from '@/shared/ui/admin-list-card-grid';
import { Button } from '@/shared/ui/button';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';
import { ListTableReveal } from '@/shared/ui/motion';
import { VIEW_MODE_CARDS, type ViewMode } from '@/shared/ui/view-mode';

type AdminBuildingsTableProps = {
  buildings: AdminBuildingListItem[];
  onSelectBuilding: (buildingId: string) => void;
  onOpenReadiness?: ((building: AdminBuildingListItem) => void) | undefined;
  viewMode?: ViewMode | undefined;
  showCompany?: boolean | undefined;
};

/**
 * Admin buildings collection as cards or table.
 */
export const AdminBuildingsTable = ({
  buildings,
  onSelectBuilding,
  onOpenReadiness,
  viewMode = VIEW_MODE_CARDS,
  showCompany = true,
}: AdminBuildingsTableProps) => {
  const t = useTranslations('Admin.buildings');

  if (viewMode === VIEW_MODE_CARDS) {
    return (
      <AdminListCardGrid className="gap-4">
        {buildings.map((building) => (
          <AdminBuildingCard
            key={building.id}
            building={building}
            onSelect={onSelectBuilding}
            onOpenReadiness={onOpenReadiness}
            showCompany={showCompany}
          />
        ))}
      </AdminListCardGrid>
    );
  }

  return (
    <ListTableReveal>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-ink-muted">
            <tr>
              <th className="px-3 py-2.5 text-left font-medium">{t('columns.name')}</th>
              {showCompany ? (
                <th className="px-3 py-2.5 text-left font-medium">{t('columns.company')}</th>
              ) : null}
              <th className="px-3 py-2.5 text-left font-medium">{t('columns.project')}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t('columns.status')}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t('columns.floors')}</th>
              <th className="px-3 py-2.5 text-center font-medium">{t('columns.apartments')}</th>
              {onOpenReadiness ? (
                <th className="px-3 py-2.5 text-right font-medium">{t('columns.actions')}</th>
              ) : null}
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
                {showCompany ? (
                  <td className="px-3 py-2.5 align-middle text-ink-secondary">
                    {building.companyName}
                  </td>
                ) : null}
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
                {onOpenReadiness ? (
                  <td className="px-3 py-2.5 text-right align-middle">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        onOpenReadiness(building);
                      }}
                    >
                      {t('readiness')}
                    </Button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ListTableReveal>
  );
};
