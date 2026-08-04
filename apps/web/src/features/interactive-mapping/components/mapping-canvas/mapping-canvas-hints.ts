import type { EditorMode } from './mapping-canvas.types';

type MappingCanvasHintParams = {
  mode: EditorMode;
  entitiesCount: number;
  selectedId: string | null;
  toolPreset: 'basic' | 'floors';
  t: (key: string, values?: Record<string, string | number>) => string;
};

/**
 * Returns the localized hint under the mapping toolbar for the current mode.
 */
export const getMappingCanvasHintText = ({
  mode,
  entitiesCount,
  selectedId,
  toolPreset,
  t,
}: MappingCanvasHintParams): string => {
  if (mode === 'draw-band') {
    return t('hintDrawBand');
  }
  if (mode === 'auto-stack') {
    return t('hintAutoStack', { count: entitiesCount });
  }
  if (mode === 'edit-polygon') {
    return t('hintEditPolygon');
  }
  if (entitiesCount === 0) {
    return t('hintEmpty');
  }
  if (!selectedId) {
    return t('hintSelectEntity');
  }
  if (toolPreset === 'floors') {
    return t('hintFloorsReady');
  }
  return t('hintAfterSave');
};
