'use client';

import type { ReadinessTaskPriority } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

import { DatePicker } from '@/shared/ui/date-picker';
import { ListboxSelect } from '@/shared/ui/listbox-select';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;

type ReadinessCriterionScheduleProps = {
  label: string;
  dueDate: string | null;
  priority: ReadinessTaskPriority;
  disabled: boolean;
  onDueDate: (value: string | null) => void;
  onPriority: (value: ReadinessTaskPriority) => void;
};

/**
 * Deadline and priority controls on an admin readiness criterion.
 * Uses the shared date picker and listbox, not the browser's native widgets.
 */
export const ReadinessCriterionSchedule = ({
  label,
  dueDate,
  priority,
  disabled,
  onDueDate,
  onPriority,
}: ReadinessCriterionScheduleProps) => {
  const t = useTranslations('Builder.readiness.report');
  const options = useMemo(
    () => PRIORITIES.map((value) => ({ value, label: t(`priorities.${value}`) })),
    [t],
  );

  return (
    <div className="flex flex-wrap items-center gap-2 pb-2 pl-7">
      <div className="w-44">
        <DatePicker
          value={dueDate ?? ''}
          disabled={disabled}
          aria-label={t('due')}
          onChange={(next) => {
            onDueDate(next === '' ? null : next);
          }}
        />
      </div>
      <div className="w-36">
        <ListboxSelect
          variant="field"
          size="full"
          value={priority}
          options={options}
          disabled={disabled}
          aria-label={`${label} ${t('priority')}`}
          onChange={(next) => {
            onPriority(next as ReadinessTaskPriority);
          }}
        />
      </div>
    </div>
  );
};
