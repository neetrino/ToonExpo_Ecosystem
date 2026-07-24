'use client';

import { FileImage } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useId, useRef, useState } from 'react';

import { useAdminUpdateFloorMutation } from '@/features/admin/hooks/use-admin-inventory';
import { catalogMediaContext } from '@/features/builder/catalog-scope';
import { uploadMediaAsset } from '@/features/media/api/media-api';
import { isAllowedMediaMimeType, MEDIA_UPLOAD_MAX_BYTES } from '@/features/media/constants';
import { AdminDeleteModal } from '@/shared/ui/admin-delete-modal';
import { Button } from '@/shared/ui/button';
import { cn } from '@/shared/ui/cn';

const FLOOR_PLAN_ICON_SIZE_PX = 14;

type FloorPlanGlanceIconProps = {
  hasFloorplan: boolean;
  companyId: string;
  buildingId: string;
  floorId: string;
  /** `icon` — glance row marker; `edit` — labeled Edit button. */
  variant?: 'icon' | 'edit' | undefined;
};

/**
 * Upload / replace floor plan — icon in glance, Edit button beside plan avatar.
 */
export const FloorPlanGlanceIcon = ({
  hasFloorplan,
  companyId,
  buildingId,
  floorId,
  variant = 'icon',
}: FloorPlanGlanceIconProps) => {
  const t = useTranslations('Admin.buildings.inventory');
  const commonT = useTranslations('Common');
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const updateFloor = useAdminUpdateFloorMutation();
  const [uploading, setUploading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const mediaContext = catalogMediaContext({ mode: 'admin', companyId });

  const busy = uploading || updateFloor.isPending;

  const uploadFile = (file: File): void => {
    if (!isAllowedMediaMimeType(file.type) || file.size > MEDIA_UPLOAD_MAX_BYTES) {
      return;
    }
    setUploading(true);
    void uploadMediaAsset(mediaContext, file)
      .then(async (asset) => {
        await updateFloor.mutateAsync({
          companyId,
          buildingId,
          floorId,
          body: { floorplanMediaId: asset.id },
        });
      })
      .finally(() => {
        setUploading(false);
      });
  };

  const openFilePicker = (): void => {
    inputRef.current?.click();
  };

  const startReplaceOrUpload = (): void => {
    if (hasFloorplan) {
      setConfirmOpen(true);
      return;
    }
    openFilePicker();
  };

  const iconControlClassName = cn(
    'inline-flex size-7 items-center justify-center rounded-md',
    'transition-colors',
    busy && 'pointer-events-none opacity-70',
  );

  return (
    <>
      {variant === 'edit' ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy}
          aria-label={hasFloorplan ? t('floorplanReplaceHint') : t('floorplanUploadHint')}
          onClick={startReplaceOrUpload}
        >
          {busy ? t('floorplanSaving') : t('floorplanEdit')}
        </Button>
      ) : hasFloorplan ? (
        <button
          type="button"
          title={t('floorplanReplaceHint')}
          aria-label={t('floorplanReplaceHint')}
          disabled={busy}
          className={cn(iconControlClassName, 'text-brand hover:bg-brand-soft')}
          onClick={() => {
            setConfirmOpen(true);
          }}
        >
          <FileImage size={FLOOR_PLAN_ICON_SIZE_PX} strokeWidth={2} aria-hidden />
        </button>
      ) : (
        <label
          htmlFor={inputId}
          title={t('floorplanUploadHint')}
          aria-label={t('floorplanUploadHint')}
          className={cn(
            iconControlClassName,
            'cursor-pointer text-ink-muted hover:bg-surface hover:text-ink-secondary',
          )}
        >
          <FileImage size={FLOOR_PLAN_ICON_SIZE_PX} strokeWidth={2} aria-hidden />
        </label>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = '';
          if (!file) {
            return;
          }
          uploadFile(file);
        }}
      />

      <AdminDeleteModal
        open={confirmOpen}
        title={t('floorplanReplaceTitle')}
        message={t('floorplanReplaceMessage')}
        confirmLabel={t('floorplanReplaceConfirm')}
        cancelLabel={commonT('cancel')}
        confirming={busy}
        onCancel={() => {
          setConfirmOpen(false);
        }}
        onConfirm={() => {
          setConfirmOpen(false);
          openFilePicker();
        }}
      />
    </>
  );
};
