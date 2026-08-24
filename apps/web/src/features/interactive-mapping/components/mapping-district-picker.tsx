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
    <section className="w-full min-w-0 rounded-lg border border-border bg-surface-elevated p-4 shadow-xs sm:p-5">
      <header className="mb-4 flex items-center gap-2">
        <MapPin className="size-4 text-brand" aria-hidden />
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
      </header>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-muted">{emptyLabel}</p>
      ) : (
        <ul className="w-full min-w-0 space-y-3">
          {sorted.map((district, index) => {
            const selected = district.id === selectedDistrictId;
            const buildingCount = buildingCounts[district.id] ?? 0;

            return (
              <li key={district.id} className="w-full min-w-0">
                <button
                  type="button"
                  className={cn(
                    'grid w-full min-w-0 grid-cols-[4.5rem_minmax(0,1fr)_auto] items-center overflow-hidden rounded-lg border border-border bg-surface-elevated text-left transition-colors hover:border-border-strong sm:grid-cols-[5rem_minmax(0,1fr)_auto]',
                    LIST_CARD_LIFT_CLASS,
                    selected && 'border-border-strong ring-1 ring-border-strong',
                  )}
                  onClick={() => {
                    onSelectDistrict(district.id);
                  }}
                >
                  <div className="flex h-full flex-col items-center justify-center bg-brand-soft px-2 py-4">
                    <span className="font-display text-3xl leading-none text-brand">
                      {formatDistrictIndex(index)}
                    </span>
                    <span className="mt-1 text-[11px] font-medium text-brand">
                      {t('districtIndex')}
                    </span>
                  </div>

                  <div className="min-w-0 px-4 py-3">
                    <p className="truncate text-sm font-semibold tracking-tight text-ink">
                      {district.name}
                    </p>
                    <p className="mt-1 flex min-w-0 items-center gap-1.5 text-xs text-ink-muted">
                      <Building2 className="size-3.5 shrink-0 text-brand" aria-hidden />
                      <span className="truncate">{t('buildingsCount', { count: buildingCount })}</span>
                    </p>
                  </div>

                  <span
                    className="mr-4 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand text-on-dark sm:mr-5"
                    aria-hidden
                  >
                    <ChevronRight className="size-5" strokeWidth={2.25} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
