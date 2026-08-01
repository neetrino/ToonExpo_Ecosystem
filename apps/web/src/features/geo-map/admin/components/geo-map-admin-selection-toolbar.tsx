'use client';

import type { AdminGeoMapModelItem } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';

type GeoMapAdminSelectionToolbarProps = {
  model: AdminGeoMapModelItem;
  isDeleting: boolean;
  onDelete: () => void;
  onClearSelection: () => void;
};

/**
 * Floating map toolbar for the selected model — quick delete without leaving the map.
 */
export const GeoMapAdminSelectionToolbar = ({
  model,
  isDeleting,
  onDelete,
  onClearSelection,
}: GeoMapAdminSelectionToolbarProps) => {
  const t = useTranslations('Admin.geoMap');

  return (
    <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap items-center gap-2 rounded-sm border border-border bg-surface-elevated/95 px-3 py-2 shadow-sm backdrop-blur-sm lg:left-auto lg:right-3 lg:max-w-md">
      <p className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{model.projectName}</p>
      <Button
        type="button"
        size="sm"
        variant="secondary"
        disabled={isDeleting}
        onClick={onClearSelection}
      >
        {t('map.deselect')}
      </Button>
      <Button type="button" size="sm" variant="danger" disabled={isDeleting} onClick={onDelete}>
        {isDeleting ? t('form.deleting') : t('form.delete')}
      </Button>
    </div>
  );
};
