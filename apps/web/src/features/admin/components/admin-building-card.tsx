'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { Building2, Home, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryCardStat,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { cn } from '@/shared/ui/cn';

type AdminBuildingCardProps = {
  building: AdminBuildingListItem;
  onSelect: (buildingId: string) => void;
};

/**
 * Building hub card — same layout language as admin project cards.
 */
export const AdminBuildingCard = ({ building, onSelect }: AdminBuildingCardProps) => {
  const t = useTranslations('Admin.buildings');

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(building.id);
      }}
      className={cn(ADMIN_INVENTORY_CARD_CLASS, 'w-full text-left')}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-ink">
            {building.name}
          </h2>
          <AdminInventoryPublicationBadge status={building.publicationStatus} />
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
          <AdminInventoryCardMetaRow icon={<Building2 className="size-3.5" strokeWidth={2} />}>
            {building.companyName}
          </AdminInventoryCardMetaRow>
          <AdminInventoryCardMetaRow icon={<Layers className="size-3.5" strokeWidth={2} />}>
            {building.projectName}
          </AdminInventoryCardMetaRow>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <AdminInventoryCardStat
          icon={<Layers className="size-4" strokeWidth={2} />}
          label={t('columns.floors')}
          value={building.floorsCount}
        />
        <AdminInventoryCardStat
          icon={<Home className="size-4" strokeWidth={2} />}
          label={t('columns.apartments')}
          value={building.apartmentsCount}
        />
      </div>
    </button>
  );
};
