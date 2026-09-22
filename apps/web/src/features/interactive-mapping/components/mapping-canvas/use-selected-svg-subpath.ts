'use client';

import { useRef, useState } from 'react';

/**
 * Which polygon subpath is targeted for delete/edit.
 * List selection clears it. Clicking a polygon on the canvas keeps it.
 */
export const useSelectedSvgSubpath = (selectedId: string | null) => {
  const [selectedSubpathIndex, setSelectedSubpathIndex] = useState<number | null>(null);
  const [trackedSelectedId, setTrackedSelectedId] = useState(selectedId);
  const selectedSubpathIndexRef = useRef<number | null>(null);
  const keepIndexOnSelectRef = useRef(false);
  selectedSubpathIndexRef.current = selectedSubpathIndex;

  if (selectedId !== trackedSelectedId) {
    setTrackedSelectedId(selectedId);
    if (keepIndexOnSelectRef.current) {
      keepIndexOnSelectRef.current = false;
    } else {
      setSelectedSubpathIndex(null);
      selectedSubpathIndexRef.current = null;
    }
  }

  const setIndex = (index: number | null): void => {
    selectedSubpathIndexRef.current = index;
    setSelectedSubpathIndex(index);
  };

  const selectSubpath = (index: number, onSelect: (id: string) => void, id: string): void => {
    if (id !== selectedId) {
      keepIndexOnSelectRef.current = true;
    }
    setIndex(index);
    onSelect(id);
  };

  return {
    selectedSubpathIndex,
    selectedSubpathIndexRef,
    setSelectedSubpathIndex: setIndex,
    selectSubpath,
  };
};
