'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import {
  AdminInventoryListShell,
  useAdminInventoryListParams,
} from '@/features/admin/components/admin-inventory-list-shell';
import { useAdminFloorsQuery } from '@/features/admin/hooks/use-admin-inventory';
import { PublicationStatusBadge } from '@/features/partners/components/partner-badges';
import { Link } from '@/i18n/navigation';
import { LIST_STATUS_BADGE_COMPACT_CLASS } from '@/shared/ui/list-status-badge';

/**
 * Admin floors hub list.
 */
export const AdminFloorsListPage = () => {
  const t = useTranslations('Admin.floors');
  const { page, pageSize, companyId } = useAdminInventoryListParams();
  const query = useAdminFloorsQuery(page, pageSize, companyId);
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
      {response ? <FloorsTable floors={response.data} /> : null}
    </AdminInventoryListShell>
  );
};

type FloorsTableProps = {
  floors: AdminFloorListItem[];
};

const FloorsTable = ({ floors }: FloorsTableProps) => {
  const t = useTranslations('Admin.floors');

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {floors.map((floor) => {
        const label =
          floor.displayLabel?.trim() ||
          floor.name?.trim() ||
          t('floorNumber', { number: floor.number });

        return (
          <Link
            key={floor.id}
            href={`/admin/projects/${floor.projectId}`}
            className="flex flex-col gap-2 rounded-lg bg-surface-elevated p-4 shadow-xs transition-[box-shadow] hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-2">
              <span className="min-w-0 truncate font-semibold text-ink">{label}</span>
              <PublicationStatusBadge
                status={floor.publicationStatus}
                className={LIST_STATUS_BADGE_COMPACT_CLASS}
              />
            </div>
            <p className="truncate text-sm text-ink-secondary">{floor.buildingName}</p>
            <p className="truncate text-sm text-ink-muted">
              {floor.projectName} · {floor.companyName}
            </p>
            <p className="text-sm text-ink-secondary">
              {t('columns.apartments')}: {floor.apartmentsCount}
            </p>
          </Link>
        );
      })}
    </div>
  );
};
