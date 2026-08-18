'use client';

import { Globe2, Save, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import {
  GEO_MAP_EDIT_ACTION_BUTTON_CLASS,
  GEO_MAP_EDIT_ACTION_ICON_CLASS,
} from '@/features/geo-map/admin/constants';
import { Button } from '@/shared/ui/button';

type GeoMapEditActionsProps = {
  busy: boolean;
  canPublish: boolean;
  isPublished: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  onSave: () => void;
  onDelete: () => void;
  onPublishChange: (isPublished: boolean) => void;
};

/**
 * Sticky Save / Delete / Publish bar — stays visible while the edit form scrolls.
 */
export const GeoMapEditActions = ({
  busy,
  canPublish,
  isPublished,
  isSaving,
  isDeleting,
  onSave,
  onDelete,
  onPublishChange,
}: GeoMapEditActionsProps) => {
  const t = useTranslations('Admin.geoMap');
  const publishLabel = isPublished ? t('form.published') : t('form.publish');

  return (
    <div className="shrink-0 border-t border-border bg-surface-elevated pt-3">
      <div className="flex gap-1.5">
        <Button
          type="button"
          size="sm"
          className={GEO_MAP_EDIT_ACTION_BUTTON_CLASS}
          disabled={busy}
          onClick={onSave}
        >
          <Save className={GEO_MAP_EDIT_ACTION_ICON_CLASS} strokeWidth={1.75} aria-hidden />
          <span className="truncate">{isSaving ? t('form.saving') : t('form.save')}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="danger"
          className={GEO_MAP_EDIT_ACTION_BUTTON_CLASS}
          disabled={busy}
          onClick={onDelete}
        >
          <Trash2 className={GEO_MAP_EDIT_ACTION_ICON_CLASS} strokeWidth={1.75} aria-hidden />
          <span className="truncate">{isDeleting ? t('form.deleting') : t('form.delete')}</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant={isPublished ? 'soft' : 'outline'}
          className={GEO_MAP_EDIT_ACTION_BUTTON_CLASS}
          disabled={busy || !canPublish}
          aria-pressed={isPublished}
          title={canPublish ? publishLabel : t('edit.publishRequiresProject')}
          onClick={() => onPublishChange(!isPublished)}
        >
          <Globe2 className={GEO_MAP_EDIT_ACTION_ICON_CLASS} strokeWidth={1.75} aria-hidden />
          <span className="truncate">{publishLabel}</span>
        </Button>
      </div>
    </div>
  );
};
