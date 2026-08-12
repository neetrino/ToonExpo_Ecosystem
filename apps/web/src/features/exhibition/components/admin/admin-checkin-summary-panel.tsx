'use client';

import type { CheckInSummaryResponse } from '@toonexpo/contracts';
import type { LucideIcon } from 'lucide-react';
import { Copy, ShieldX, UserCheck, Users } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Card } from '@/shared/ui/card';
import { cn } from '@/shared/ui/cn';
import { LIST_CARD_STAGGER_MS, StaggerGroup } from '@/shared/ui/motion';

const KPI_STAGGER_MS = LIST_CARD_STAGGER_MS;
const KPI_BASE_DELAY_MS = 80;
const KPI_DURATION_MS = 520;
const ICON_STROKE_WIDTH = 2;

type AdminCheckinSummaryPanelProps = {
  summary: CheckInSummaryResponse;
};

type SummaryTone = 'teal' | 'blue' | 'orange' | 'accent';

const TONE_BG_CLASS: Record<SummaryTone, string> = {
  teal: 'bg-[#d3f6f6]',
  blue: 'bg-[#ebf3fc]',
  orange: 'bg-[#fcefe5]',
  accent: 'bg-[#f3effd]',
};

const TONE_ICON_CLASS: Record<SummaryTone, string> = {
  teal: 'text-[#2bb5ad]',
  blue: 'text-[#3d7fd4]',
  orange: 'text-[#f07a35]',
  accent: 'text-[#6b5ce7]',
};

const CARD_MOTION_CLASS = cn(
  'transition-[translate,box-shadow] duration-[400ms]',
  'ease-[cubic-bezier(0.25,0.46,0.45,0.94)]',
  'hover:-translate-y-1 hover:shadow-md',
  'motion-reduce:transition-none motion-reduce:hover:translate-y-0',
);

/**
 * Check-in attendance totals and per-day breakdown for an event.
 */
export const AdminCheckinSummaryPanel = ({ summary }: AdminCheckinSummaryPanelProps) => {
  const t = useTranslations('Admin.events.checkInSummary');
  const locale = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const stats: ReadonlyArray<{
    key: string;
    label: string;
    value: number;
    icon: LucideIcon;
    tone: SummaryTone;
  }> = [
    {
      key: 'allowed',
      label: t('allowed'),
      value: summary.allowedCount,
      icon: UserCheck,
      tone: 'teal',
    },
    {
      key: 'unique',
      label: t('unique'),
      value: summary.uniqueVisitors,
      icon: Users,
      tone: 'blue',
    },
    {
      key: 'duplicates',
      label: t('duplicates'),
      value: summary.duplicateAttempts,
      icon: Copy,
      tone: 'orange',
    },
    {
      key: 'denied',
      label: t('denied'),
      value: summary.deniedCount,
      icon: ShieldX,
      tone: 'accent',
    },
  ];

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold text-ink">{t('title')}</h2>
      <StaggerGroup
        force
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4 [&>*]:h-full [&>*]:min-w-0"
        staggerMs={KPI_STAGGER_MS}
        baseDelayMs={KPI_BASE_DELAY_MS}
        durationMs={KPI_DURATION_MS}
      >
        {stats.map((stat) => (
          <SummaryStat
            key={stat.key}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            tone={stat.tone}
          />
        ))}
      </StaggerGroup>
      {summary.perDay.length > 0 ? (
        <Card variant="elevated" className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-xs uppercase text-ink-muted">
                <th className="px-2 py-2">{t('day')}</th>
                <th className="px-2 py-2">{t('allowed')}</th>
                <th className="px-2 py-2">{t('duplicates')}</th>
                <th className="px-2 py-2">{t('denied')}</th>
              </tr>
            </thead>
            <tbody>
              {summary.perDay.map((row) => (
                <tr key={row.date} className="border-b border-border last:border-0">
                  <td className="px-2 py-2">{dateFormatter.format(new Date(row.date))}</td>
                  <td className="px-2 py-2">{row.allowedCount}</td>
                  <td className="px-2 py-2">{row.duplicateAttempts}</td>
                  <td className="px-2 py-2">{row.deniedCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ) : (
        <p className="text-sm text-ink-secondary">{t('noDays')}</p>
      )}
    </section>
  );
};

type SummaryStatProps = {
  label: string;
  value: number;
  icon: LucideIcon;
  tone: SummaryTone;
};

const SummaryStat = ({ label, value, icon: Icon, tone }: SummaryStatProps) => (
  <Card
    variant="elevated"
    padding="none"
    className={cn('flex h-full flex-row items-center gap-3 p-3 sm:p-3.5', CARD_MOTION_CLASS)}
  >
    <div
      className={cn(
        'inline-flex size-9 shrink-0 items-center justify-center rounded-lg',
        TONE_BG_CLASS[tone],
      )}
    >
      <Icon className={cn('size-4', TONE_ICON_CLASS[tone])} strokeWidth={ICON_STROKE_WIDTH} aria-hidden />
    </div>
    <div className="flex min-w-0 flex-col gap-0.5">
      <p className="text-[10px] font-medium tracking-[0.06em] text-ink-muted uppercase">{label}</p>
      <p className="text-xl leading-tight font-semibold tracking-tight text-ink">{value}</p>
    </div>
  </Card>
);
