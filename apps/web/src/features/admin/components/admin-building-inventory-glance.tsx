'use client';

import type {
  AdminBuildingInventoryGlance,
  ApartmentAvailabilitySummary,
} from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { FloorPlanGlanceIcon } from '@/features/admin/components/floor-plan-glance-icon';
import { cn } from '@/shared/ui/cn';

type AdminBuildingInventoryGlanceProps = {
  glance: AdminBuildingInventoryGlance;
  onSelectFloor: (floorId: string) => void;
};

const segmentPercent = (count: number, total: number): number => {
  if (total <= 0 || count <= 0) {
    return 0;
  }
  return (count / total) * 100;
};

/**
 * Figma “Inventory at a glance” card — totals + per-floor sales bars.
 */
export const AdminBuildingInventoryGlanceCard = ({
  glance,
  onSelectFloor,
}: AdminBuildingInventoryGlanceProps) => {
  const t = useTranslations('Admin.buildings.inventory');

  return (
    <div className="rounded-2xl bg-surface-elevated px-6 pb-6 pt-4 shadow-xs ring-1 ring-border">
      <div className="grid grid-cols-3 gap-4">
        <AvailabilityStat
          value={glance.availability.available}
          label={t('available')}
          valueClassName="text-brand-secondary"
        />
        <AvailabilityStat
          value={glance.availability.reserved}
          label={t('reserved')}
          valueClassName="text-warning"
        />
        <AvailabilityStat
          value={glance.availability.sold}
          label={t('sold')}
          valueClassName="text-ink-muted"
        />
      </div>

      {glance.floors.length === 0 ? (
        <p className="mt-6 text-sm text-ink-secondary">{t('noFloors')}</p>
      ) : (
        <ul className="mt-6 flex flex-col gap-1.5">
          {glance.floors.map((floor) => {
            const hasFloorplan = Boolean(floor.floorplanMediaId ?? floor.floorplan);
            return (
              <li key={floor.id}>
                <div className="flex w-full items-center gap-1.5">
                  <button
                    type="button"
                    className={cn(
                      'flex min-w-0 flex-1 items-center gap-3 rounded-md px-2 py-1.5 text-left',
                      'transition-colors hover:bg-brand-soft/40',
                    )}
                    onClick={() => {
                      onSelectFloor(floor.id);
                    }}
                  >
                    <span className="min-w-20 shrink-0 whitespace-nowrap text-xs font-bold text-ink-muted">
                      {t('floorCode', { number: floor.number })}
                    </span>
                    <FloorSalesBar availability={floor.availability} />
                    <span className="w-10 shrink-0 text-right text-xs text-ink-muted">
                      {t('availableOfTotal', {
                        available: floor.availability.available,
                        total: floor.availability.total,
                      })}
                    </span>
                  </button>
                  <span className="inline-flex shrink-0 items-center justify-center pr-1">
                    <FloorPlanGlanceIcon
                      hasFloorplan={hasFloorplan}
                      companyId={glance.builderCompanyId}
                      buildingId={glance.id}
                      floorId={floor.id}
                    />
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

type AvailabilityStatProps = {
  value: number;
  label: string;
  valueClassName: string;
};

const AvailabilityStat = ({ value, label, valueClassName }: AvailabilityStatProps) => (
  <div className="flex flex-col items-center gap-1 text-center">
    <p className={cn('text-[30px] font-bold leading-none tracking-tight', valueClassName)}>
      {value}
    </p>
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-muted">{label}</p>
  </div>
);

type FloorSalesBarProps = {
  availability: ApartmentAvailabilitySummary;
};

const FloorSalesBar = ({ availability }: FloorSalesBarProps) => {
  const { available, reserved, total } = availability;
  if (total <= 0) {
    return (
      <div className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-border" aria-hidden />
    );
  }

  const availableEnd = segmentPercent(available, total);
  const reservedEnd = availableEnd + segmentPercent(reserved, total);

  return (
    <svg
      className="h-2.5 min-w-0 flex-1 overflow-hidden rounded-full bg-border"
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      aria-hidden
    >
      {available > 0 ? (
        <rect
          x="0"
          y="0"
          width={availableEnd}
          height="10"
          className="fill-[var(--color-brand-secondary)]"
        />
      ) : null}
      {reserved > 0 ? (
        <rect
          x={availableEnd}
          y="0"
          width={reservedEnd - availableEnd}
          height="10"
          className="fill-[var(--color-warning)]"
        />
      ) : null}
    </svg>
  );
};
