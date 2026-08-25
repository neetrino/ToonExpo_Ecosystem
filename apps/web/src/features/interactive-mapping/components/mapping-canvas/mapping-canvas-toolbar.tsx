'use client';

import { Minimize2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Button } from '@/shared/ui/button';
import { svgPathToPolygonShape, type PolygonShape } from '../../utils/curved-polygon';
import {
  AutoStackIcon,
  BandStripIcon,
  ClearPointsIcon,
  MarkerPinIcon,
  PolygonShapeIcon,
  SaveCheckIcon,
  SelectCursorIcon,
  TrashPointIcon,
  UndoPointIcon,
} from './mapping-toolbar-icons';
import type { EditorMode, MappingEntity } from './mapping-canvas.types';

type MappingCanvasToolbarProps = {
  mode: EditorMode;
  toolPreset: 'basic' | 'floors';
  selectedId: string | null;
  selected: MappingEntity | null;
  draftPointsLength: number;
  selectedDraftIndex: number | null;
  viewBoxWidth: number;
  viewBoxHeight: number;
  changeMode: (mode: EditorMode) => void;
  resolveOpenDraft: () => boolean;
  replaceOnCommitRef: { current: boolean };
  setMode: (mode: EditorMode) => void;
  setSelectedDraftIndex: (index: number | null) => void;
  replaceEditShape: (shape: PolygonShape) => void;
  startFreshPolygon: () => void;
  deletePolygon: () => void;
  deleteMarker?: (() => void) | undefined;
  closePolygon: () => void;
  deleteSelectedDraftPoint: () => void;
  undoLastDraftPoint: () => void;
  clearDraft: () => void;
  draftPoints: { length: number };
  modeIsDrawPolygon: boolean;
  modeIsEditPolygon: boolean;
  modeIsDrawBand: boolean;
  modeIsAutoStack: boolean;
  onExitFullscreen?: (() => void) | undefined;
};

type ToolId = 'select' | 'place-marker' | 'draw-polygon' | 'draw-band' | 'auto-stack';

const TOOL_BUTTON_CLASS =
  'inline-flex items-center justify-center gap-1.5 rounded-[15px] border px-2.5 py-1.5 text-xs uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40';

const BASIC_TOOLS: Array<[ToolId, string, typeof SelectCursorIcon]> = [
  ['select', 'toolSelect', SelectCursorIcon],
  ['place-marker', 'toolMarker', MarkerPinIcon],
  ['draw-polygon', 'toolPolygon', PolygonShapeIcon],
];

const FLOOR_TOOLS: Array<[ToolId, string, typeof BandStripIcon]> = [
  ['draw-band', 'toolBand', BandStripIcon],
  ['auto-stack', 'toolAuto', AutoStackIcon],
];

export const MappingCanvasToolbar = ({
  mode,
  toolPreset,
  selectedId,
  selected,
  draftPointsLength,
  selectedDraftIndex,
  viewBoxWidth,
  viewBoxHeight,
  changeMode,
  resolveOpenDraft,
  replaceOnCommitRef,
  setMode,
  setSelectedDraftIndex,
  replaceEditShape,
  startFreshPolygon,
  deletePolygon,
  deleteMarker,
  closePolygon,
  deleteSelectedDraftPoint,
  undoLastDraftPoint,
  clearDraft,
  draftPoints,
  modeIsDrawPolygon,
  modeIsEditPolygon,
  modeIsDrawBand,
  modeIsAutoStack,
  onExitFullscreen,
}: MappingCanvasToolbarProps) => {
  const t = useTranslations('Admin.interactiveMapping.canvas');
  const floorTools = toolPreset === 'floors' ? FLOOR_TOOLS : [];

  return (
    <>
      <div className="flex flex-wrap items-center justify-end gap-2">
        <div className="flex flex-wrap justify-end gap-2" role="toolbar" aria-label={t('toolsAria')}>
        {[...BASIC_TOOLS, ...floorTools].map(([value, labelKey, Icon]) => {
          const needsSelection = value === 'draw-polygon' || value === 'place-marker';
          const disabled = needsSelection && !selectedId;
          const label = t(labelKey);
          const canDeleteMarker =
            value === 'place-marker' &&
            selected?.markerX != null &&
            selected.markerY != null &&
            Boolean(deleteMarker);
          const canDeletePolygon = value === 'draw-polygon' && Boolean(selected?.svgPath);
          return (
            <span key={value} className="inline-flex items-center gap-2">
              <button
                type="button"
                title={disabled ? t('selectEntityFirst') : label}
                aria-label={label}
                disabled={disabled}
                className={`${TOOL_BUTTON_CLASS} ${
                  mode === value ? 'border-ink' : 'border-border'
                }`}
                onClick={() => changeMode(value)}
              >
                <Icon />
                <span className="hidden sm:inline">{label}</span>
              </button>
              {canDeleteMarker ? (
                <button
                  type="button"
                  className={`${TOOL_BUTTON_CLASS} border-red-700/40 px-3 text-red-800`}
                  onClick={deleteMarker}
                  title={t('deleteMarker')}
                  aria-label={t('deleteMarker')}
                >
                  {t('deleteMarker')}
                </button>
              ) : null}
              {canDeletePolygon ? (
                <button
                  type="button"
                  className={`${TOOL_BUTTON_CLASS} border-red-700/40 px-3 text-red-800`}
                  onClick={deletePolygon}
                  title={t('deletePolygon')}
                  aria-label={t('deletePolygon')}
                >
                  {t('deletePolygon')}
                </button>
              ) : null}
            </span>
          );
        })}
        {selected?.svgPath ? (
          <>
            <button
              type="button"
              className={`${TOOL_BUTTON_CLASS} border-border px-3`}
              onClick={() => {
                if (!selected.svgPath) return;
                if (!resolveOpenDraft()) return;
                replaceOnCommitRef.current = true;
                setMode('edit-polygon');
                setSelectedDraftIndex(null);
                replaceEditShape(
                  svgPathToPolygonShape(selected.svgPath, viewBoxWidth, viewBoxHeight),
                );
              }}
            >
              {t('editDrag')}
            </button>
            <button
              type="button"
              className={`${TOOL_BUTTON_CLASS} border-border px-3`}
              onClick={() => {
                if (!resolveOpenDraft()) return;
                startFreshPolygon();
              }}
            >
              {t('newPolygon')}
            </button>
          </>
        ) : null}
        {modeIsDrawPolygon ||
        modeIsEditPolygon ||
        ((modeIsDrawBand || modeIsAutoStack) && draftPoints.length > 0) ? (
          <>
            {modeIsDrawPolygon || modeIsEditPolygon ? (
              <button
                type="button"
                className={`${TOOL_BUTTON_CLASS} border-ink bg-ink text-on-dark`}
                onClick={() => {
                  if (modeIsEditPolygon) {
                    replaceOnCommitRef.current = true;
                  }
                  closePolygon();
                }}
                disabled={draftPointsLength < 1}
                title={t('saveDrawing', { count: draftPointsLength })}
                aria-label={t('saveDrawingAria', { count: draftPointsLength })}
              >
                <SaveCheckIcon />
                <span>{draftPointsLength}</span>
              </button>
            ) : null}
            <button
              type="button"
              className={`${TOOL_BUTTON_CLASS} border-red-700/40 text-red-800`}
              onClick={deleteSelectedDraftPoint}
              disabled={selectedDraftIndex == null}
              title={t('deleteSelectedPoint')}
              aria-label={t('deleteSelectedPointAria')}
            >
              <TrashPointIcon />
            </button>
            <button
              type="button"
              className={`${TOOL_BUTTON_CLASS} border-border`}
              onClick={undoLastDraftPoint}
              disabled={draftPointsLength === 0}
              title={t('undoLastPoint')}
              aria-label={t('undoLastPointAria')}
            >
              <UndoPointIcon />
            </button>
            <button
              type="button"
              className={`${TOOL_BUTTON_CLASS} border-border`}
              onClick={clearDraft}
              title={t('clearAllPoints')}
              aria-label={t('clearAllPointsAria')}
            >
              <ClearPointsIcon />
            </button>
          </>
        ) : null}
        </div>
        {onExitFullscreen ? (
          <Button type="button" size="sm" variant="secondary" onClick={onExitFullscreen}>
            <Minimize2 className="size-4" aria-hidden />
            {t('exitFullscreen')}
          </Button>
        ) : null}
      </div>

      {draftPointsLength > 0 && modeIsDrawPolygon ? (
        <p className="text-xs text-amber-800">
          {t('draftFollowCursor', {
            floorsSuffix: toolPreset === 'floors' ? t('floorsReplaceSuffix') : '',
          })}
        </p>
      ) : null}
      {draftPointsLength > 0 && modeIsEditPolygon ? (
        <p className="text-xs text-amber-800">{t('editCurveHint')}</p>
      ) : null}
      {draftPointsLength > 0 && (modeIsDrawBand || modeIsAutoStack) ? (
        <p className="text-xs text-amber-800">
          {modeIsDrawBand
            ? t('bandProgress', { count: draftPointsLength })
            : t('autoProgress', { count: draftPointsLength })}
        </p>
      ) : null}
    </>
  );
};
