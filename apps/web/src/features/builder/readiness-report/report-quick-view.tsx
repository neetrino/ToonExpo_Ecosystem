'use client';

import type { ReadinessReport } from '@/features/builder/readiness-report/report-model';
import { ReportMeter } from '@/features/builder/readiness-report/report-meters';
import { REPORT_CARD_CLASS } from '@/features/builder/readiness-report/report-styles';
import { cn } from '@/shared/ui/cn';
import { Calendar, CircleCheck, Clock, Eye, FolderOpen, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

type QuickCard = {
  key: string;
  value: number;
  label: string;
  hint: string;
  icon: LucideIcon;
  iconClass: string;
  valueClass: string;
  tone: 'success' | 'warning' | 'danger' | 'muted';
};

type ReportQuickViewProps = {
  report: ReadinessReport;
  periodLabel: string;
};

export const ReportQuickView = ({ report, periodLabel }: ReportQuickViewProps) => {
  const t = useTranslations('Builder.readiness.report');
  const cards: QuickCard[] = [
    {
      key: 'open',
      value: report.open,
      label: t('openWork'),
      hint: t('ofTotal', { total: report.total }),
      icon: FolderOpen,
      iconClass: 'bg-brand/10 text-brand',
      valueClass: 'text-brand',
      tone: 'muted',
    },
    {
      key: 'overdue',
      value: report.overdue,
      label: t('overdue'),
      hint: t('overdueHint'),
      icon: Clock,
      iconClass: 'bg-danger/10 text-danger',
      valueClass: 'text-danger',
      tone: 'danger',
    },
    {
      key: 'upcoming',
      value: report.upcoming,
      label: t('upcoming'),
      hint: t('upcomingHint'),
      icon: Calendar,
      iconClass: 'bg-warning/15 text-warning',
      valueClass: 'text-warning',
      tone: 'warning',
    },
    {
      key: 'done',
      value: report.done,
      label: t('readinessLabel'),
      hint: t('readinessHint'),
      icon: CircleCheck,
      iconClass: 'bg-success/15 text-success',
      valueClass: 'text-success',
      tone: 'success',
    },
    {
      key: 'review',
      value: report.inReview,
      label: t('inReview'),
      hint: t('inReviewHint'),
      icon: Eye,
      iconClass: 'bg-brand-soft text-brand',
      valueClass: 'text-brand',
      tone: report.inReview > 0 ? 'warning' : 'muted',
    },
  ];

  return (
    <section className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-muted">
        {t('quickView')}
      </p>
      <h2 className="text-2xl font-semibold tracking-tight text-ink">{t('quickTitle')}</h2>
      <p className="text-sm text-ink-secondary">{t('quickHint', { period: periodLabel })}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {cards.map((card) => (
          <article key={card.key} className={cn(REPORT_CARD_CLASS, 'p-4')}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted">
                {card.label}
              </p>
              <span
                className={cn('flex size-9 items-center justify-center rounded-xl', card.iconClass)}
              >
                <card.icon className="size-4" aria-hidden />
              </span>
            </div>
            <p className={cn('mt-2 text-3xl font-semibold tabular-nums', card.valueClass)}>
              {card.value}
            </p>
            <p className="text-sm text-ink-secondary">{card.hint}</p>
            <ReportMeter
              percent={report.total === 0 ? 0 : Math.round((card.value / report.total) * 100)}
              tone={card.tone}
            />
          </article>
        ))}
      </div>
    </section>
  );
};
