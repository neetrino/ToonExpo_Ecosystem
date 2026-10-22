'use client';

import { BuilderReadinessCategoryHelp } from '@/features/builder/components/builder-readiness-criteria-block';
import type { ReportEpic } from '@/features/builder/readiness-report/report-model';
import { meterToneFor, ReportMeter } from '@/features/builder/readiness-report/report-meters';
import { ReportTaskRow } from '@/features/builder/readiness-report/report-task';
import { REPORT_CARD_CLASS } from '@/features/builder/readiness-report/report-styles';
import { cn } from '@/shared/ui/cn';
import { ChevronDown } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';

type ReportEpicCardProps = {
  epic: ReportEpic;
};

export const ReportEpicCard = ({ epic }: ReportEpicCardProps) => {
  const t = useTranslations('Builder.readiness.report');
  const tStatus = useTranslations('Builder.readiness.statuses');
  const [open, setOpen] = useState(false);
  const hasAttention = epic.tasks.some((task) => task.status === 'attention');

  return (
    <article className={REPORT_CARD_CLASS}>
      <button
        type="button"
        className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left"
        aria-expanded={open}
        onClick={() => {
          setOpen((current) => !current);
        }}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{epic.title}</span>
          <span className="mt-1 block text-xs text-ink-secondary">
            {t('taskCount', { done: epic.done, total: epic.total })}
          </span>
        </span>
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold tabular-nums text-ink">{epic.percent}%</span>
          <ChevronDown className={cn('size-4 text-ink-muted', open && 'rotate-180')} aria-hidden />
        </span>
      </button>
      <div className="px-4 pb-3">
        <ReportMeter percent={epic.percent} tone={meterToneFor(epic.percent, hasAttention)} />
      </div>
      {open ? (
        <div>
          <p className="px-4 pb-2 text-xs text-ink-secondary">{tStatus(epic.status)}</p>
          <div className="px-4 pb-3">
            <BuilderReadinessCategoryHelp
              categoryName={epic.title}
              status={epic.status}
              helpAvailable={epic.helpAvailable}
              serviceProviderCategoryId={epic.serviceProviderCategoryId}
              recommendationSummary={epic.recommendation}
            />
          </div>
          <ul>
            {epic.tasks.map((task, index) => (
              <ReportTaskRow key={task.id} task={task} index={index} />
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
};
