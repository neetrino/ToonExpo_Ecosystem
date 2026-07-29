'use client';

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
  closePolygon: () => void;
  deleteSelectedDraftPoint: () => void;
  undoLastDraftPoint: () => void;
  clearDraft: () => void;
  draftPoints: { length: number };
  modeIsDrawPolygon: boolean;
  modeIsEditPolygon: boolean;
  modeIsDrawBand: boolean;
  modeIsAutoStack: boolean;
};

const BASIC_TOOLS = [
  ['select', 'Ընտրել', SelectCursorIcon],
  ['place-marker', 'Marker', MarkerPinIcon],
  ['draw-polygon', 'Polygon', PolygonShapeIcon],
] as const;

const FLOOR_TOOLS = [
  ['draw-band', 'Գոտի', BandStripIcon],
  ['auto-stack', 'Ավտո', AutoStackIcon],
] as const;

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
  closePolygon,
  deleteSelectedDraftPoint,
  undoLastDraftPoint,
  clearDraft,
  draftPoints,
  modeIsDrawPolygon,
  modeIsEditPolygon,
  modeIsDrawBand,
  modeIsAutoStack,
}: MappingCanvasToolbarProps) => {
  const floorTools = toolPreset === 'floors' ? FLOOR_TOOLS : [];

  return (
    <>
      <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Mapping tools">
        {[...BASIC_TOOLS, ...floorTools].map(([value, label, Icon]) => {
          const needsSelection = value === 'draw-polygon' || value === 'place-marker';
          const disabled = needsSelection && !selectedId;
          return (
            <button
              key={value}
              type="button"
              title={disabled ? 'Նախ ընտրիր միավորը ձախ ցանկից' : label}
              aria-label={label}
              disabled={disabled}
              className={`inline-flex items-center gap-1.5 border px-2.5 py-1.5 text-xs uppercase tracking-[0.14em] disabled:cursor-not-allowed disabled:opacity-40 ${
                mode === value ? 'border-foreground bg-foreground text-background' : 'border-border'
              }`}
              onClick={() => changeMode(value)}
            >
              <Icon />
              <span className="hidden sm:inline">{label}</span>
            </button>
          );
        })}
        {selected?.svgPath ? (
          <>
            <button
              type="button"
              className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
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
              Խմբագրել · քաշել
            </button>
            <button
              type="button"
              className="border border-border px-3 py-1.5 text-xs uppercase tracking-[0.14em]"
              onClick={() => {
                if (!resolveOpenDraft()) return;
                startFreshPolygon();
              }}
            >
              Նոր polygon
            </button>
            <button
              type="button"
              className="border border-red-700/40 px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-red-800"
              onClick={deletePolygon}
            >
              Ջնջել polygon
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
                className="inline-flex items-center gap-1.5 border border-foreground bg-foreground px-2.5 py-1.5 text-xs uppercase tracking-[0.14em] text-background disabled:opacity-40"
                onClick={() => {
                  if (modeIsEditPolygon) {
                    replaceOnCommitRef.current = true;
                  }
                  closePolygon();
                }}
                disabled={draftPointsLength < 1}
                title={`Պահպանել գծագիրը (${draftPointsLength} կետ)`}
                aria-label={`Պահպանել գծագիրը, ${draftPointsLength} կետ`}
              >
                <SaveCheckIcon />
                <span>{draftPointsLength}</span>
              </button>
            ) : null}
            <button
              type="button"
              className="inline-flex items-center justify-center border border-red-700/40 px-2.5 py-1.5 text-red-800 disabled:opacity-40"
              onClick={deleteSelectedDraftPoint}
              disabled={selectedDraftIndex == null}
              title="Ջնջել ընտրված կետը (Delete)"
              aria-label="Ջնջել ընտրված կետը"
            >
              <TrashPointIcon />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center border border-border px-2.5 py-1.5 disabled:opacity-40"
              onClick={undoLastDraftPoint}
              disabled={draftPointsLength === 0}
              title="Հետ · վերջին կետ (Ctrl+Z)"
              aria-label="Հետ վերջին կետ"
            >
              <UndoPointIcon />
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center border border-border px-2.5 py-1.5"
              onClick={clearDraft}
              title="Չեղարկել բոլոր կետերը"
              aria-label="Չեղարկել բոլոր կետերը"
            >
              <ClearPointsIcon />
            </button>
          </>
        ) : null}
      </div>

      {draftPointsLength > 0 && modeIsDrawPolygon ? (
        <p className="text-xs text-amber-800">
          Գիծը հետևում է cursor-ին։ Կտտացրու կետեր ավելացնելու համար · ✓ / Enter՝ պահպանել
          {toolPreset === 'floors' ? ' (փոխարինում է հին գծագիրը)' : ''}։
        </p>
      ) : null}
      {draftPointsLength > 0 && modeIsEditPolygon ? (
        <p className="text-xs text-amber-800">
          Եզրի կետը քաշիր՝ գիծը կլորացնելու համար (գիծը մնում է cursor-ի տակ)։ Alt+click՝ ուղղել։ ✓
          / Enter՝ պահպանել։
        </p>
      ) : null}
      {draftPointsLength > 0 && (modeIsDrawBand || modeIsAutoStack) ? (
        <p className="text-xs text-amber-800">
          {modeIsDrawBand
            ? `Գոտի · ${draftPointsLength}/3 կտտոց`
            : `Ավտո · ${draftPointsLength}/4 կտտոց`}
        </p>
      ) : null}
    </>
  );
};
