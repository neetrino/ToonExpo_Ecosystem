'use client';

import { BuilderReadinessCriterionHelp } from '@/features/builder/components/builder-readiness-criterion-help';
import type {
  ReportTask,
  ReportTaskStatus,
} from '@/features/builder/readiness-report/report-model';
import { cn } from '@/shared/ui/cn';
import { Check, ChevronRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState } from 'react';

import { formatReadinessDate } from '@/features/readiness/utils/format-readiness-date';

const STATUS_MARK: Record<ReportTaskStatus, string> = {
  done: 'bg-success text-on-dark',
  in_progress: 'bg-brand/15 text-brand',
  attention: 'bg-danger/15 text-danger',
  not_started: 'bg-surface text-ink-muted ring-1 ring-border',
};

type ReportTaskRowProps = {
  task: ReportTask;
  index: number;
};

const DetailGrid = ({ task }: { task: ReportTask }) => {
  const t = useTranslations('Builder.readiness.report');
  const locale = useLocale();
  const when = (value: string | null): string =>
    value ? formatReadinessDate(value, locale) : t('dateUnknown');

  return (
    <dl className="mt-3 grid gap-3 border-t border-border pt-3 text-sm sm:grid-cols-2">
      <div>
        <dt className="text-ink-muted">{t('status')}</dt>
        <dd className="font-medium text-ink">{t(`statuses.${task.status}`)}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('priority')}</dt>
        <dd className="font-medium text-ink">{t(`priorities.${task.priority}`)}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('created')}</dt>
        <dd className="font-medium text-ink">{when(task.createdAt)}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('started')}</dt>
        <dd className="font-medium text-ink">{when(task.startedAt)}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('completed')}</dt>
        <dd className="font-medium text-ink">{when(task.completedAt)}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('due')}</dt>
        <dd className="font-medium text-ink">{task.dueDate ?? t('dateUnknown')}</dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('sequence')}</dt>
        <dd className="font-medium text-ink">
          {task.sequence === null ? t('dateUnknown') : `#${task.sequence}`}
        </dd>
      </div>
      <div>
        <dt className="text-ink-muted">{t('lastChange')}</dt>
        <dd className="font-medium text-ink">{when(task.statusChangedAt)}</dd>
      </div>
    </dl>
  );
};

export const ReportTaskRow = ({ task, index }: ReportTaskRowProps) => {
  const t = useTranslations('Builder.readiness.report');
  const locale = useLocale();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  return (
    <li className="border-t border-border px-4 py-3">
      <div className="flex gap-3">
        <span
          className={cn(
            'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full text-[10px]',
            STATUS_MARK[task.status],
          )}
          aria-hidden
        >
          {task.status === 'done' ? <Check className="size-3" /> : index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{task.title}</p>
          <p className="mt-1 text-xs text-ink-secondary">
            {t(`statuses.${task.status}`)} · {t(`outcomes.${task.outcome}`)}
            {task.lateDays ? ` · ${t('lateDays', { count: task.lateDays })}` : ''}
            {task.dueDate ? ` · ${t('dueShort', { date: task.dueDate })}` : ''}
            {task.sequence !== null ? ` · #${task.sequence}` : ''}
          </p>
          {task.criterion ? (
            <div className="mt-2">
              <BuilderReadinessCriterionHelp item={task.criterion} />
            </div>
          ) : null}
          <button
            type="button"
            className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-brand"
            aria-expanded={detailsOpen}
            onClick={() => {
              setDetailsOpen((open) => !open);
            }}
          >
            <ChevronRight className={cn('size-3.5', detailsOpen && 'rotate-90')} aria-hidden />
            {detailsOpen ? t('hideDetails') : t('details')}
          </button>
          {detailsOpen ? <DetailGrid task={task} /> : null}
          <button
            type="button"
            className="mt-2 flex items-center gap-1 text-sm font-medium text-brand"
            aria-expanded={historyOpen}
            onClick={() => {
              setHistoryOpen((open) => !open);
            }}
          >
            <ChevronRight className={cn('size-3.5', historyOpen && 'rotate-90')} aria-hidden />
            {historyOpen ? t('hideHistory') : t('history')}
          </button>
          {historyOpen ? (
            <ol className="mt-2 list-decimal pl-5 text-sm text-ink-secondary">
              {task.history.length === 0 ? (
                <li>{t('historyCurrent', { status: t(`statuses.${task.status}`) })}</li>
              ) : (
                task.history.map((event) => (
                  <li key={`${event.at}-${event.toStatus}`}>
                    {event.fromStatus
                      ? t('historyChange', {
                          from: t(`historyStatuses.${event.fromStatus}`),
                          to: t(`historyStatuses.${event.toStatus}`),
                        })
                      : t('historyCurrent', { status: t(`historyStatuses.${event.toStatus}`) })}
                    {' · '}
                    {formatReadinessDate(event.at, locale)}
                  </li>
                ))
              )}
            </ol>
          ) : null}
        </div>
      </div>
    </li>
  );
};
