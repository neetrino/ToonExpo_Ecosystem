'use client';

import { useTranslations } from 'next-intl';
import { Controller, type Control } from 'react-hook-form';

import type { UpdateProjectFormValues } from '@/features/builder/schemas/project.schema';
import { PROJECT_CATALOG_CRITERION_ICON } from '@/features/catalog/components/project-catalog-details-bits';
import {
  TIMELINE_STAGE_KEYS,
  type TimelineStageKey,
} from '@/features/catalog/utils/project-detail-presentation';
import { DatePicker } from '@/shared/ui/date-picker';
import { parseIsoDate, toIsoDate } from '@/shared/ui/date-picker-utils';

const CATALOG_VALUE_COL_CLASS = 'min-w-0 w-full';
const CATALOG_KV_ROW_CLASS =
  'grid min-w-0 grid-cols-[minmax(0,1fr)_minmax(0,12.5rem)] items-start gap-3 border-b border-header-border py-3';

const MONTH_YEAR_PATTERN = /^(\d{1,2})\/(\d{4})$/;

const catalogDateToIso = (value: string): string => {
  const trimmed = value.trim();
  if (parseIsoDate(trimmed)) {
    return trimmed;
  }
  const match = MONTH_YEAR_PATTERN.exec(trimmed);
  if (!match) {
    return '';
  }
  const month = Number(match[1]);
  const year = Number(match[2]);
  if (month < 1 || month > 12) {
    return '';
  }
  return toIsoDate(new Date(year, month - 1, 1));
};

const isoToCatalogMonthYear = (iso: string): string => {
  const date = parseIsoDate(iso);
  if (!date) {
    return '';
  }
  return `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
};

type ProjectConstructionTimelineEditorProps = {
  control: Control<UpdateProjectFormValues>;
};

type StageDateRowProps = {
  stage: TimelineStageKey;
  control: Control<UpdateProjectFormValues>;
  label: string;
};

const StageDateRow = ({ stage, control, label }: StageDateRowProps) => {
  const fieldId = `catalog-timeline-date-${stage}`;
  const CalendarIcon = PROJECT_CATALOG_CRITERION_ICON.constructionStart;
  return (
    <div className={CATALOG_KV_ROW_CLASS}>
      <label
        htmlFor={fieldId}
        className="flex min-w-0 items-start gap-2 pt-2.5 text-sm text-ink-muted"
      >
        <CalendarIcon className="mt-0.5 size-4 shrink-0 text-brand" strokeWidth={1.75} aria-hidden />
        <span className="min-w-0 break-words">{label}</span>
      </label>
      <Controller
        control={control}
        name={`timelineStageDates.${stage}`}
        render={({ field }) => (
          <div className={CATALOG_VALUE_COL_CLASS}>
            <DatePicker
              id={fieldId}
              name={field.name}
              value={catalogDateToIso(field.value ?? '')}
              aria-label={label}
              onBlur={field.onBlur}
              onChange={(iso) => field.onChange(isoToCatalogMonthYear(iso))}
              className="h-10 w-full min-w-0 justify-start text-left text-sm font-semibold text-ink-navy"
            />
          </div>
        )}
      />
    </div>
  );
};

/**
 * Construction timeline dates — one date field per stage (Details-style rows).
 */
export const ProjectConstructionTimelineEditor = ({
  control,
}: ProjectConstructionTimelineEditorProps) => {
  const tTimeline = useTranslations('Catalog.projectDetail');

  return (
    <div className="grid min-w-0 grid-cols-1 gap-x-10 sm:grid-cols-2">
      {TIMELINE_STAGE_KEYS.map((stage) => (
        <StageDateRow
          key={stage}
          stage={stage}
          control={control}
          label={tTimeline(`timelineStages.${stage}`)}
        />
      ))}
    </div>
  );
};
