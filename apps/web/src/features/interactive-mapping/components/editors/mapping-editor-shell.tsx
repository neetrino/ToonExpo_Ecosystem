'use client';

import type { VisualHotspotTargetType } from '@toonexpo/contracts';
import { Maximize2 } from 'lucide-react';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { Button } from '@/shared/ui/button';

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
  sidebarFooter?: ReactNode | undefined;
  labelDigitsOnly?: boolean | undefined;
  deleteEntityLabel?: string | undefined;
  onDeleteEntity?: ((id: string) => Promise<void>) | undefined;
  onAfterSave?: (() => void) | undefined;
};

const DEFAULT_VIEWPORT_CLASS =
  'relative h-[min(70dvh,720px)] w-full cursor-crosshair touch-none select-none overflow-hidden border border-border bg-muted';

const FULLSCREEN_VIEWPORT_CLASS =
  'relative h-[calc(100dvh-5.5rem)] w-full cursor-crosshair touch-none select-none overflow-hidden border border-border bg-muted';

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
  sidebarFooter,
  labelDigitsOnly = false,
  deleteEntityLabel = 'Delete',
  onDeleteEntity,
  onAfterSave,
}: MappingEditorShellProps) => {
  const canvasRef = useRef<MappingCanvasHandle>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [portalReady, setPortalReady] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
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
      viewportClassName={fullscreen ? FULLSCREEN_VIEWPORT_CLASS : DEFAULT_VIEWPORT_CLASS}
      {...(toolPreset === 'floors' ? { onBulkPaths: editor.onBulkPaths } : {})}
    />
  );

  const handleDeleteEntity = (): void => {
    const id = editor.selectedId;
    if (!id || !onDeleteEntity) {
      return;
    }
    if (!window.confirm('Ջնջե՞լ այս բնակարանը։')) {
      return;
    }
    setDeletePending(true);
    void (async () => {
      try {
        await onDeleteEntity(id);
        editor.setSelectedId(null);
        onAfterSave?.();
      } catch (error) {
        window.alert(error instanceof Error ? error.message : 'Delete failed');
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
      footer={sidebarFooter}
      labelDigitsOnly={labelDigitsOnly}
      deleteLabel={deleteEntityLabel}
      onSelect={editor.setSelectedId}
      onLabelChange={editor.onLabelChange}
      onSave={() => {
        void editor.onSave(
          () => canvasRef.current?.flushPolygonDraft() ?? null,
          () => canvasRef.current?.hasOpenDraft() ?? false,
        );
      }}
      onClear={() => {
        void editor.onClear();
      }}
      onDelete={onDeleteEntity ? handleDeleteEntity : undefined}
    />
  );

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => setFullscreen(true)}>
          <Maximize2 className="size-4" aria-hidden />
          Open fullscreen map
        </Button>
      </div>
      {!fullscreen ? (
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          {sidebar}
          <div className="relative min-w-0 space-y-2">
            <button
              type="button"
              className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-sm border border-border bg-background/95 px-2.5 py-1.5 text-xs text-ink shadow-sm hover:bg-surface"
              onClick={() => setFullscreen(true)}
            >
              <Maximize2 className="size-3.5" aria-hidden />
              Fullscreen
            </button>
            {canvas}
          </div>
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
        onClose={() => setFullscreen(false)}
      />
    </>
  );
};
