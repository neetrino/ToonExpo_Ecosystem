'use client';

import { useEffect, type MutableRefObject } from 'react';
import type { EditorMode } from './mapping-canvas.types';

type UseMappingCanvasKeyboardParams = {
  modeRef: MutableRefObject<EditorMode>;
  draftRef: MutableRefObject<{ length: number }>;
  selectedDraftIndexRef: MutableRefObject<number | null>;
  replaceOnCommitRef: MutableRefObject<boolean>;
  nudgeSelection: (dx: number, dy: number) => void;
  closePolygon: () => void;
  deleteSelectedDraftPoint: () => void;
  undoLastDraftPoint: () => void;
  clearDraft: () => void;
  setSelectedDraftIndex: (index: number | null) => void;
  setMode: (mode: EditorMode) => void;
};

export const useMappingCanvasKeyboard = ({
  modeRef,
  draftRef,
  selectedDraftIndexRef,
  replaceOnCommitRef,
  nudgeSelection,
  closePolygon,
  deleteSelectedDraftPoint,
  undoLastDraftPoint,
  clearDraft,
  setSelectedDraftIndex,
  setMode,
}: UseMappingCanvasKeyboardParams) => {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      const step = event.shiftKey ? 0.01 : 0.003;
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        nudgeSelection(-step, 0);
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        nudgeSelection(step, 0);
        return;
      }
      if (event.key === 'ArrowUp') {
        event.preventDefault();
        nudgeSelection(0, -step);
        return;
      }
      if (event.key === 'ArrowDown') {
        event.preventDefault();
        nudgeSelection(0, step);
        return;
      }

      if (
        event.key === 'Enter' &&
        (modeRef.current === 'draw-polygon' || modeRef.current === 'edit-polygon') &&
        draftRef.current.length >= 1
      ) {
        event.preventDefault();
        if (modeRef.current === 'edit-polygon') {
          replaceOnCommitRef.current = true;
        }
        closePolygon();
        return;
      }

      if (
        (event.key === 'Delete' || event.key === 'Backspace') &&
        selectedDraftIndexRef.current != null
      ) {
        event.preventDefault();
        deleteSelectedDraftPoint();
        return;
      }

      const isUndoKey =
        (event.key === 'z' || event.key === 'Z') &&
        (event.ctrlKey || event.metaKey) &&
        !event.shiftKey;
      if ((isUndoKey || event.key === 'Backspace') && draftRef.current.length > 0) {
        event.preventDefault();
        undoLastDraftPoint();
        return;
      }

      if (event.key === 'Escape') {
        if (selectedDraftIndexRef.current != null) {
          setSelectedDraftIndex(null);
          return;
        }
        clearDraft();
        setMode('select');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    clearDraft,
    closePolygon,
    deleteSelectedDraftPoint,
    draftRef,
    modeRef,
    nudgeSelection,
    replaceOnCommitRef,
    selectedDraftIndexRef,
    setMode,
    setSelectedDraftIndex,
    undoLastDraftPoint,
  ]);
};
