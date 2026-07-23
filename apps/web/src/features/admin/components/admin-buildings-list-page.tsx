'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { useAdminBuildingsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

/**
 * Admin buildings hub list.
 */
export const AdminBuildingsListPage = () => {
  const t = useTranslations('Admin.buildings');
  const { page, pageSize, companyId } = useAdminInventoryListParams();
  const query = useAdminBuildingsQuery(page, pageSize, companyId);
  const response = query.data;

  return (
    <AdminInventoryListShell
      title={t('title')}
      subtitle={t('subtitle', { count: response?.meta.total ?? 0 })}
      empty={t('empty')}
      loading={t('loading')}
      error={t('error')}
      isLoading={query.isLoading}
      isError={query.isError || !response}
      total={response?.meta.total ?? 0}
      page={response?.meta.page ?? page}
      totalPages={response?.meta.totalPages ?? 0}
    >
      {response ? <BuildingsTable buildings={response.data} /> : null}
    </AdminInventoryListShell>
  );
};

type BuildingsTableProps = {
  buildings: AdminBuildingListItem[];
};

const BuildingsTable = ({ buildings }: BuildingsTableProps) => {
  const t = useTranslations('Admin.buildings');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {buildings.map((building) => (
        <Link
          key={building.id}
          href={`/admin/projects/${building.projectId}`}
          className="flex flex-col gap-2 rounded-lg bg-surface-elevated p-4 shadow-xs transition-[box-shadow] hover:shadow-sm"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="min-w-0 truncate font-semibold text-ink">{building.name}</span>
            <PublicationStatusBadge
              status={building.publicationStatus}
              className={LIST_STATUS_BADGE_COMPACT_CLASS}
            />
          </div>
          <p className="truncate text-sm text-ink-secondary">{building.projectName}</p>
          <p className="truncate text-sm text-ink-muted">{building.companyName}</p>
          <div className="flex flex-wrap gap-3 text-sm text-ink-secondary">
            <span>
              {t('columns.floors')}: {building.floorsCount}
            </span>
            <span>
              {t('columns.apartments')}: {building.apartmentsCount}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};
