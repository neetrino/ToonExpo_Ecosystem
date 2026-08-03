'use client';

import type { AdminGeoMapModelItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { cn } from '@/shared/ui/cn';

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
    <ul className="space-y-1">
      {models.map((model) => {
        const selected = model.id === selectedId;
        const title = model.projectName ?? model.mediaTitle ?? t('list.unassigned');
        const status = !model.projectId
          ? t('list.unassigned')
          : model.isPublished
            ? t('list.published')
            : t('list.draft');

        return (
          <li key={model.id}>
            <button
              type="button"
              className={cn(
                'flex w-full items-start justify-between gap-2 rounded-sm border px-3 py-2 text-left',
                'transition-colors hover:border-border-strong',
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
          </li>
        );
      })}
    </ul>
  );
};
