import type { LucideIcon } from 'lucide-react';
import {
  AlignLeft,
  Building2,
  ClipboardList,
  DoorOpen,
  Hash,
  Layers,
  MapPin,
  MoveVertical,
  Paintbrush,
  PanelTop,
  ShieldCheck,
} from 'lucide-react';

import type {
  ApartmentDetailCriterionId,
  ApartmentDetailRow,
} from '@/features/catalog/utils/build-apartment-detail-rows';
import { ApartmentSalesStatusBadge } from '@/shared/ui/apartment-sales-status-badge';
import { cn } from '@/shared/ui/cn';

type ApartmentDetailCriteriaPanelProps = {
  title: string;
  rows: ApartmentDetailRow[];
};

const CRITERION_ICON: Record<ApartmentDetailCriterionId, LucideIcon> = {
  neighborhood: MapPin,
  building: Building2,
  floor: Layers,
  unitNumber: Hash,
  status: ShieldCheck,
  windows: PanelTop,
  balconies: DoorOpen,
  ceilingHeight: MoveVertical,
  finishingStatus: Paintbrush,
  generalDescription: AlignLeft,
  handoverDescription: ClipboardList,
};

/**
 * Property details panel — card grid + description list (screenshot style).
 */
export const ApartmentDetailCriteriaPanel = ({
  title,
  rows,
}: ApartmentDetailCriteriaPanelProps) => {
  const cardRows = rows.filter((row) => !row.wide);
  const listRows = rows.filter((row) => row.wide);

  return (
    <section>
      <h2 className="font-brand text-2xl font-bold tracking-tight text-ink-navy">{title}</h2>

      <dl className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cardRows.map((row) => (
          <CriterionCard key={row.id} row={row} />
        ))}
      </dl>

      {listRows.length > 0 ? (
        <dl className="mt-6 border-t border-header-border">
          {listRows.map((row) => (
            <CriterionListRow key={row.id} row={row} />
          ))}
        </dl>
      ) : null}
    </section>
  );
};

const CriterionCard = ({ row }: { row: ApartmentDetailRow }) => {
  const Icon = CRITERION_ICON[row.id];

  return (
    <div
      className={cn(
        'flex min-h-[4.5rem] items-center gap-3 rounded-[15px] border border-header-border',
        'bg-canvas px-4 py-3.5 transition-[transform,box-shadow] duration-200',
        'hover:-translate-y-0.5 hover:shadow-sm',
      )}
    >
      <span
        className={cn(
          'flex size-10 shrink-0 items-center justify-center rounded-lg',
          'bg-band-mist text-brand-deep',
        )}
        aria-hidden
      >
        <Icon className="size-4" strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <dt className="text-[10px] font-bold tracking-widest text-header-muted uppercase">
          {row.label}
        </dt>
        <dd className="mt-1">
          <CriterionValue row={row} />
        </dd>
      </div>
    </div>
  );
};

const CriterionListRow = ({ row }: { row: ApartmentDetailRow }) => {
  const Icon = CRITERION_ICON[row.id];

  return (
    <div className="flex items-center gap-3 border-b border-header-border py-4 last:border-b-0">
      <Icon className="size-4 shrink-0 text-brand-deep" strokeWidth={2} aria-hidden />
      <dt className="shrink-0 text-[10px] font-bold tracking-widest text-header-muted uppercase">
        {row.label}
      </dt>
      <dd className="min-w-0 flex-1 text-right text-sm font-semibold whitespace-pre-line text-ink-navy">
        {row.value}
      </dd>
    </div>
  );
};

const CriterionValue = ({ row }: { row: ApartmentDetailRow }) => {
  if (row.salesStatus != null) {
    return <ApartmentSalesStatusBadge status={row.salesStatus} label={row.value} />;
  }

  return <p className="truncate text-sm font-bold text-ink-navy">{row.value}</p>;
};
