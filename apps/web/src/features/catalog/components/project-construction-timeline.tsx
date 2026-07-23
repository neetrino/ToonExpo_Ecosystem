import type { ProjectDetail } from '@toonexpo/contracts';
import { getTranslations } from 'next-intl/server';

import {
  resolveActiveTimelineIndex,
  TIMELINE_STAGE_KEYS,
  timelineStageStatus,
  type TimelineStageStatus,
} from '@/features/catalog/utils/project-detail-presentation';
import { cn } from '@/shared/ui/cn';

type ProjectConstructionTimelineProps = {
  project: ProjectDetail;
};

/**
 * Five-stage construction timeline — Figma `89:876`.
 */
export const ProjectConstructionTimeline = async ({
  project,
}: ProjectConstructionTimelineProps) => {
  const t = await getTranslations('Catalog.projectDetail');
  const activeIndex = resolveActiveTimelineIndex(project);

  return (
    <section className="page-container py-12 sm:py-16">
      <h2 className="font-brand text-2xl font-bold tracking-[-0.02em] text-ink-navy">
        {t('timelineTitle')}
      </h2>
      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {TIMELINE_STAGE_KEYS.map((key, index) => {
          const status = timelineStageStatus(index, activeIndex);
          return (
            <TimelineCard
              key={key}
              stageLabel={t(`timelineStages.${key}`)}
              stageIndexLabel={t('timelineStageIndex', { number: index + 1 })}
              statusLabel={t(`timelineStatus.${status}`)}
              status={status}
            />
          );
        })}
      </div>
    </section>
  );
};

const TimelineCard = ({
  stageLabel,
  stageIndexLabel,
  statusLabel,
  status,
}: {
  stageLabel: string;
  stageIndexLabel: string;
  statusLabel: string;
  status: TimelineStageStatus;
}) => (
  <div
    className={cn(
      'flex min-h-[6.5rem] flex-col justify-between rounded-2xl p-4 ring-1',
      status === 'complete' && 'bg-band-mist ring-brand-secondary/30',
      status === 'inProgress' && 'bg-brand-deep text-on-dark ring-brand-deep',
      status === 'upcoming' && 'bg-surface-elevated ring-header-border',
    )}
  >
    <p
      className={cn(
        'text-[10px] font-bold tracking-widest uppercase',
        status === 'inProgress' ? 'text-on-dark/70' : 'text-header-muted',
      )}
    >
      {stageIndexLabel}
    </p>
    <p className="font-brand text-lg font-bold leading-6">{stageLabel}</p>
    <p className={cn('text-xs', status === 'inProgress' ? 'text-on-dark/80' : 'text-header-muted')}>
      {statusLabel}
    </p>
  </div>
);
