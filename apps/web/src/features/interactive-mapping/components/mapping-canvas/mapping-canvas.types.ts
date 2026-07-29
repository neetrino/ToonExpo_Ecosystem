export type MappingEntity = {
  id: string;
  label: string;
  title: string;
  markerX: number | null;
  markerY: number | null;
  svgPath: string | null;
};

export type MappingBulkPathUpdate = {
  id: string;
  svgPath: string;
  markerX: number;
  markerY: number;
};

export type MappingCanvasHandle = {
  /** Commits open draft (≥1 point). Returns saved svgPath, or null if nothing to save. */
  flushPolygonDraft: () => string | null;
  hasOpenDraft: () => boolean;
  getDraftPointCount: () => number;
};

export type EditorMode =
  'select' | 'place-marker' | 'draw-polygon' | 'edit-polygon' | 'draw-band' | 'auto-stack';

export type MappingCanvasProps = {
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  viewBoxWidth: number;
  viewBoxHeight: number;
  entities: MappingEntity[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onChangeEntity: (
    id: string,
    patch: Partial<Pick<MappingEntity, 'markerX' | 'markerY' | 'svgPath'>>,
  ) => void;
  onPolygonClosed?: (id: string, svgPath: string) => void;
  onPolygonDeleted?: (id: string) => void;
  /** Floors preset adds Band + Auto stack tools. */
  toolPreset?: 'basic' | 'floors';
  /** Auto-stack assigns paths to all entities (index 0 = bottom floor). */
  onBulkPaths?: (updates: MappingBulkPathUpdate[]) => void;
  /** Override default viewport box classes (e.g. fullscreen editor). */
  viewportClassName?: string;
};
