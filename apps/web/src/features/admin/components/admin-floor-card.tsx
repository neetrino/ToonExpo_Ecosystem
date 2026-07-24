'use client';

import type { AdminFloorListItem } from '@toonexpo/contracts';
import { Building, Building2, Home, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryCardStat,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { cn } from '@/shared/ui/cn';

type AdminFloorCardProps = {
  floor: AdminFloorListItem;
  onSelect: (floor: AdminFloorListItem) => void;
};

/**
 * Floor hub card — same layout language as admin project cards.
 */
export const AdminFloorCard = ({ floor, onSelect }: AdminFloorCardProps) => {
  const t = useTranslations('Admin.floors');
  const label =
    floor.displayLabel?.trim() || floor.name?.trim() || t('floorNumber', { number: floor.number });

  return (
    <button
      type="button"
      onClick={() => {
        onSelect(floor);
      }}
      className={cn(ADMIN_INVENTORY_CARD_CLASS, 'w-full text-left')}
    >
      <div className="flex flex-1 flex-col p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-ink">
            {label}
          </h2>
          <AdminInventoryPublicationBadge status={floor.publicationStatus} />
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
          <AdminInventoryCardMetaRow icon={<Building className="size-3.5" strokeWidth={2} />}>
            {floor.buildingName}
          </AdminInventoryCardMetaRow>
          <AdminInventoryCardMetaRow icon={<Building2 className="size-3.5" strokeWidth={2} />}>
            {floor.companyName}
          </AdminInventoryCardMetaRow>
          <AdminInventoryCardMetaRow icon={<Layers className="size-3.5" strokeWidth={2} />}>
            {floor.projectName}
          </AdminInventoryCardMetaRow>
        </div>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border px-4 py-3">
        <AdminInventoryCardStat
          icon={<Home className="size-4" strokeWidth={2} />}
          label={t('columns.apartments')}
          value={floor.apartmentsCount}
        />
      </div>
    </button>
  );
};
