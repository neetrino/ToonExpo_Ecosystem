'use client';

import type { AdminBuildingListItem } from '@toonexpo/contracts';
import { Building2, ClipboardCheck, Home, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  ADMIN_INVENTORY_CARD_CLASS,
  AdminInventoryCardMetaRow,
  AdminInventoryCardStat,
  AdminInventoryPublicationBadge,
} from '@/features/admin/components/admin-inventory-card';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

type AdminBuildingCardProps = {
  building: AdminBuildingListItem;
  onSelect: (buildingId: string) => void;
  onOpenReadiness?: ((building: AdminBuildingListItem) => void) | undefined;
  showCompany?: boolean | undefined;
};

/**
 * Building hub card — same layout language as admin project cards.
 */
export const AdminBuildingCard = ({
  building,
  onSelect,
  onOpenReadiness,
  showCompany = true,
}: AdminBuildingCardProps) => {
  const t = useTranslations('Admin.buildings');

  return (
    <div className={cn(ADMIN_INVENTORY_CARD_CLASS, 'w-full')}>
      <button
        type="button"
        onClick={() => {
          onSelect(building.id);
        }}
        className="flex flex-1 flex-col p-4 text-left"
      >
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="min-w-0 flex-1 text-base font-semibold tracking-tight text-ink">
            {building.name}
          </h2>
          <AdminInventoryPublicationBadge status={building.publicationStatus} />
        </div>

        <div className="mt-2 flex flex-col gap-1 text-sm text-ink-secondary">
          {showCompany ? (
            <AdminInventoryCardMetaRow icon={<Building2 className="size-3.5" strokeWidth={2} />}>
              {building.companyName}
            </AdminInventoryCardMetaRow>
          ) : null}
          <AdminInventoryCardMetaRow icon={<Layers className="size-3.5" strokeWidth={2} />}>
            {building.projectName}
          </AdminInventoryCardMetaRow>
        </div>
      </button>

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
        {onOpenReadiness ? (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="ml-auto"
            onClick={(event) => {
              event.stopPropagation();
              onOpenReadiness(building);
            }}
          >
            <ClipboardCheck className="size-3.5" aria-hidden />
            {t('readiness')}
          </Button>
        ) : null}
      </div>
    </div>
  );
};
