'use client';

import type { AdminProjectListItem } from '@toonexpo/contracts';
import { Home, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { AdminBuildingInventorySheet } from '@/features/admin/components/admin-building-inventory-sheet';
import {
  AdminInventoryCardStat,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { ADMIN_COMPANIES_MAX_PAGE_SIZE } from '@/features/admin/constants';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { SideSheet } from '@/shared/ui/side-sheet';

export type AdminProjectBuildingsTarget = Pick<
  AdminProjectListItem,
  'id' | 'name' | 'builderCompanyId'
>;

type AdminProjectBuildingsSheetProps = {
  project: AdminProjectBuildingsTarget | null;
  onClose: () => void;
};

/**
 * Side sheet listing buildings for one project; opens inventory glance on select.
 */
export const AdminProjectBuildingsSheet = ({
  project,
  onClose,
}: AdminProjectBuildingsSheetProps) => {
  const t = useTranslations('Admin.projects.buildingsSheet');
  const tBuildings = useTranslations('Admin.buildings');
  const [buildingId, setBuildingId] = useState<string | null>(null);
  const [floorId, setFloorId] = useState<string | null>(null);

  const query = useAdminBuildingsQuery(
    1,
    ADMIN_COMPANIES_MAX_PAGE_SIZE,
    project?.builderCompanyId,
    project?.id,
    { enabled: project != null },
  );

  useEffect(() => {
    setBuildingId(null);
    setFloorId(null);
  }, [project?.id]);

  const buildings = query.data?.data ?? [];
  const open = project != null;

  const handleClose = (): void => {
    setBuildingId(null);
    setFloorId(null);
    onClose();
  };

  return (
    <>
      <SideSheet
        open={open}
        onClose={handleClose}
        title={t('title')}
        description={project?.name}
        size="comfortable"
      >
        {!project || query.isLoading ? (
          <p className="text-sm text-ink-secondary">{t('loading')}</p>
        ) : null}

        {project && (query.isError || (!query.isLoading && !query.data)) ? (
          <p role="alert" className="text-sm text-danger">
            {t('error')}
          </p>
        ) : null}

        {project && query.data && buildings.length === 0 ? (
          <p className="text-sm text-ink-secondary">{t('empty')}</p>
        ) : null}

        {buildings.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {buildings.map((building) => (
              <li key={building.id}>
                <button
                  type="button"
                  onClick={() => {
                    setFloorId(null);
                    setBuildingId(building.id);
                  }}
                  className="flex w-full flex-col gap-3 rounded-lg border border-border bg-surface-elevated p-3.5 text-left shadow-xs transition-colors hover:border-brand/40 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                >
                  <span className="flex flex-wrap items-start justify-between gap-2">
                    <span className="min-w-0 flex-1 text-sm font-semibold tracking-tight text-ink">
                      {building.name}
                    </span>
                    <AdminInventoryPublicationBadge status={building.publicationStatus} />
                  </span>
                  <span className="flex flex-wrap items-center gap-x-4 gap-y-2">
                    <AdminInventoryCardStat
                      icon={<Layers className="size-4" strokeWidth={2} />}
                      label={tBuildings('columns.floors')}
                      value={building.floorsCount}
                    />
                    <AdminInventoryCardStat
                      icon={<Home className="size-4" strokeWidth={2} />}
                      label={tBuildings('columns.apartments')}
                      value={building.apartmentsCount}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </SideSheet>

      <AdminBuildingInventorySheet
        buildingId={buildingId}
        floorId={floorId}
        stackLevel={1}
        onClose={() => {
          setFloorId(null);
          setBuildingId(null);
        }}
        onSelectFloor={setFloorId}
        onCloseFloor={() => {
          setFloorId(null);
        }}
      />
    </>
  );
};
