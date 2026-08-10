'use client';

import type { AdminGeoMapModelItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';
import {
  LIST_CARD_DURATION_MS,
  LIST_CARD_LIFT_CLASS,
  LIST_CARD_STAGGER_MS,
  LIST_CONTENT_BASE_DELAY_MS,
  StaggerGroup,
} from '@/shared/ui/motion';

type GeoMapModelListProps = {
  models: AdminGeoMapModelItem[];
  selectedId: string | null;
  onSelect: (id: string) => void;
};

/**
 * Side-panel list of placed map models (draft + published + unassigned).
 */
export const GeoMapModelList = ({ models, selectedId, onSelect }: GeoMapModelListProps) => {
  const t = useTranslations('Admin.geoMap');

  if (models.length === 0) {
    return (
      <p className="rounded-sm border border-dashed border-border px-3 py-4 text-sm text-ink-muted">
        {t('list.empty')}
      </p>
    );
  }

  return (
    <StaggerGroup
      force
      className="flex flex-col gap-1"
      staggerMs={LIST_CARD_STAGGER_MS}
      baseDelayMs={LIST_CONTENT_BASE_DELAY_MS}
      durationMs={LIST_CARD_DURATION_MS}
    >
      {models.map((model) => {
        const selected = model.id === selectedId;
        const title = model.projectName ?? model.mediaTitle ?? t('list.unassigned');
        const status = !model.projectId
          ? t('list.unassigned')
          : model.isPublished
            ? t('list.published')
            : t('list.draft');

        return (
          <button
            key={model.id}
            type="button"
            className={cn(
              'flex w-full items-start justify-between gap-2 rounded-sm border px-3 py-2 text-left',
              LIST_CARD_LIFT_CLASS,
              selected ? 'border-brand bg-brand-soft/40' : 'border-border bg-background',
            )}
            onClick={() => onSelect(model.id)}
          >
            <span className="min-w-0">
              <span className="block truncate text-sm font-medium text-ink">{title}</span>
              <span className="mt-0.5 block text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                {status}
              </span>
            </span>
          </button>
        );
      })}
    </StaggerGroup>
  );
};
