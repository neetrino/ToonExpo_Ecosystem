'use client';

import type { VisualHotspotTargetType } from '@toonexpo/contracts';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { ConfirmDeleteModal } from '@/shared/ui/confirm-delete-modal';

import { useMappingEditorState } from '../../hooks/use-mapping-editor-state';
import { MappingCanvas, type MappingCanvasHandle } from '../mapping-canvas/mapping-canvas';
import { MappingEntitySidebar, type MappingEditorEntity } from './mapping-entity-sidebar';
import { MappingFullscreenWorkspace } from './mapping-fullscreen-workspace';

export type { MappingEditorEntity };

export type MappingEditorShellProps = {
  companyId: string;
  canvasId: string;
  targetType: VisualHotspotTargetType;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  initialEntities: MappingEditorEntity[];
  listTitle: string;
  toolPreset?: 'basic' | 'floors' | undefined;
  emptyHint?: string | undefined;
  searchPlaceholder?: string | undefined;
  sidebarFooter?: ReactNode | undefined;
  labelDigitsOnly?: boolean | undefined;
  deleteEntityLabel?: string | undefined;
  confirmDeleteMessage?: string | undefined;
  onDeleteEntity?: ((id: string) => Promise<void>) | undefined;
  onAfterSave?: (() => void) | undefined;
};

const DEFAULT_VIEWPORT_CLASS =
  'relative h-[min(70dvh,720px)] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-[15px] border border-border bg-muted';

const FULLSCREEN_VIEWPORT_CLASS =
  'relative h-[calc(100dvh-4rem)] w-full cursor-crosshair touch-none select-none overflow-hidden rounded-[15px] border border-border bg-muted';

/**
 * Shared MappingCanvas + entity list with Nest hotspot persistence.
 * Fullscreen mode hides admin chrome; Save still persists to Nest.
 */
export const MappingEditorShell = ({
  companyId,
  canvasId,
  targetType,
  imageUrl,
  imageWidth,
  imageHeight,
  viewBoxWidth,
  viewBoxHeight,
  initialEntities,
  listTitle,
  toolPreset = 'basic',
  emptyHint,
  searchPlaceholder,
  sidebarFooter,
  labelDigitsOnly = false,
  deleteEntityLabel,
  confirmDeleteMessage,
  onDeleteEntity,
  onAfterSave,
}: MappingEditorShellProps) => {
  const t = useTranslations('Admin.interactiveMapping.canvas');
  const canvasRef = useRef<MappingCanvasHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    'entity' | 'mapping' | 'marker' | 'allPolygons' | null
  >(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const editor = useMappingEditorState({
    companyId,
    canvasId,
    targetType,
    initialEntities,
    onAfterSave,
  });

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    if (!fullscreen) {
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFullscreen(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [fullscreen]);

  const canvas = (
    <MappingCanvas
      ref={canvasRef}
      toolPreset={toolPreset}
      imageUrl={imageUrl}
      imageWidth={imageWidth}
      imageHeight={imageHeight}
      viewBoxWidth={viewBoxWidth}
      viewBoxHeight={viewBoxHeight}
      entities={editor.entities}
      selectedId={editor.selectedId}
      onSelect={editor.setSelectedId}
      onChangeEntity={editor.onChangeEntity}
      onPolygonClosed={editor.onPolygonClosed}
      onPolygonDeleted={editor.onPolygonDeleted}
      onDeleteMarker={() => {
        setPendingAction('marker');
      }}
      viewportClassName={fullscreen ? FULLSCREEN_VIEWPORT_CLASS : DEFAULT_VIEWPORT_CLASS}
      {...(toolPreset === 'floors' ? { onBulkPaths: editor.onBulkPaths } : {})}
      {...(fullscreen
        ? { onExitFullscreen: () => setFullscreen(false) }
        : { onOpenFullscreen: () => setFullscreen(true) })}
    />
  );

  const handleDeleteEntity = (id: string): void => {
    if (!onDeleteEntity) {
      return;
    }
    editor.setSelectedId(id);
    setPendingDeleteId(id);
    setPendingAction('entity');
  };

  const confirmPendingAction = (): void => {
    if (pendingAction === 'mapping') {
      setPendingAction(null);
      void editor.onClear();
      return;
    }
    if (pendingAction === 'marker') {
      setPendingAction(null);
      void editor.onClearMarker();
      return;
    }
    if (pendingAction === 'allPolygons') {
      setPendingAction(null);
      void editor.onClearAllPolygons();
      return;
    }
    const id = pendingDeleteId;
    if (pendingAction !== 'entity' || !id || !onDeleteEntity) {
      return;
    }
    setDeletePending(true);
    void (async () => {
      try {
        await onDeleteEntity(id);
        editor.setSelectedId(null);
        setPendingDeleteId(null);
        onAfterSave?.();
        setPendingAction(null);
      } catch (error) {
        window.alert(error instanceof Error ? error.message : t('deleteFailed'));
      } finally {
        setDeletePending(false);
      }
    })();
  };

  const sidebar = (
    <MappingEntitySidebar
      listTitle={listTitle}
      entities={editor.entities}
      selectedId={editor.selectedId}
      dirtyIds={editor.dirtyIds}
      pending={editor.pending || deletePending}
      message={editor.message}
      emptyHint={emptyHint}
      searchPlaceholder={searchPlaceholder}
      footer={sidebarFooter}
      labelDigitsOnly={labelDigitsOnly}
      deleteLabel={deleteEntityLabel ?? t('deleteDefault')}
      onSelect={editor.setSelectedId}
      onLabelChange={editor.onLabelChange}
      onSave={() => {
        void editor.onSave(
          () => canvasRef.current?.flushPolygonDraft() ?? null,
          () => canvasRef.current?.hasOpenDraft() ?? false,
        );
      }}
      onClear={() => {
        setPendingAction('mapping');
      }}
      onClearAllPolygons={
        editor.entities.some((entity) => entity.svgPath)
          ? () => {
              setPendingAction('allPolygons');
            }
          : undefined
      }
      deleteAllPolygonsLabel={t('deleteAllPolygons')}
      onDelete={onDeleteEntity ? handleDeleteEntity : undefined}
    />
  );

  return (
    <>
      {!fullscreen ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {sidebar}
          <div className="min-w-0">{canvas}</div>
        </div>
      ) : (
        <p className="rounded-sm border border-border bg-surface px-3 py-2 text-sm text-ink-muted">
          Mapping workspace is open in fullscreen. Close it to return here — saves already
          persisted.
        </p>
      )}
      <MappingFullscreenWorkspace
        open={fullscreen}
        portalReady={portalReady}
        sidebar={sidebar}
        canvas={canvas}
      />
      <ConfirmDeleteModal
        open={pendingAction != null}
        message={
          pendingAction === 'mapping'
            ? t('removeMappingConfirm')
            : pendingAction === 'marker'
              ? t('confirmDeleteMarker')
              : pendingAction === 'allPolygons'
                ? t('deleteAllPolygonsConfirm')
                : (confirmDeleteMessage ?? t('confirmDeleteApartment'))
        }
        confirming={deletePending || editor.pending}
        onCancel={() => {
          if (!deletePending && !editor.pending) {
            setPendingAction(null);
            setPendingDeleteId(null);
          }
        }}
        onConfirm={confirmPendingAction}
      />
    </>
  );
};
