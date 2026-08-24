'use client';

import type { InteractiveMappingDistrictSummary } from '@toonexpo/contracts';
import { Building2, ChevronRight, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import { LIST_CARD_LIFT_CLASS } from '@/shared/ui/motion';

const DISTRICT_INDEX_PAD = 2;

export type MappingDistrictPickerProps = {
  districts: InteractiveMappingDistrictSummary[];
  buildingCounts: Record<string, number>;
  selectedDistrictId: string | null;
  title: string;
  emptyLabel: string;
  onSelectDistrict: (districtId: string) => void;
};

const formatDistrictIndex = (index: number): string =>
  String(index + 1).padStart(DISTRICT_INDEX_PAD, '0');

/**
 * District cards for interactive-mapping phase pickers (buildings / floors / apartments).
 */
export const MappingDistrictPicker = ({
  districts,
  buildingCounts,
  selectedDistrictId,
  title,
  emptyLabel,
  onSelectDistrict,
}: MappingDistrictPickerProps) => {
  const t = useTranslations('Admin.interactiveMapping.forms.districtPicker');

  const sorted = [...districts].sort((a, b) => {
    const byOrder = a.displayOrder - b.displayOrder;
    return byOrder !== 0 ? byOrder : a.name.localeCompare(b.name);
  });

  return (
    <section className="rounded-lg border border-border bg-surface-elevated p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <MapPin className="size-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="space-y-3">
          {sorted.map((district, index) => {
            const selected = district.id === selectedDistrictId;
            const buildingCount = buildingCounts[district.id] ?? 0;

            return (
              <li key={district.id}>
                <button
                  type="button"
                  className={cn(
                    'flex w-full items-center gap-0 overflow-hidden rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:border-border-strong',
                    LIST_CARD_LIFT_CLASS,
                    selected && 'border-border-strong ring-1 ring-border-strong',
                  )}
                  onClick={() => {
                    onSelectDistrict(district.id);
                  }}
                >
                  <div className="flex w-[72px] shrink-0 flex-col items-center justify-center bg-brand-soft px-2 py-4 sm:w-20">
                    <span className="font-display text-3xl leading-none text-brand">
                      {formatDistrictIndex(index)}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-brand">
                      {t('districtIndex')}
                    </span>
                  </div>

                  <div className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold tracking-tight text-ink">
                        {district.name}
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-ink-muted">
                        <Building2 className="size-3.5 shrink-0 text-brand" aria-hidden />
                        {t('buildingsCount', { count: buildingCount })}
                      </p>
                    </div>

                    <span
                      className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-dark hover:bg-brand-hover"
                      aria-hidden
                    >
                      <ChevronRight className="size-5" strokeWidth={2.25} />
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
