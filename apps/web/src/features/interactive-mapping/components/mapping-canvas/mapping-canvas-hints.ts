import type { EditorMode } from './mapping-canvas.types';

type MappingCanvasHintParams = {
  mode: EditorMode;
  entitiesCount: number;
  selectedId: string | null;
  toolPreset: 'basic' | 'floors';
};

export const getMappingCanvasHintText = ({
  mode,
  entitiesCount,
  selectedId,
  toolPreset,
}: MappingCanvasHintParams): string => {
  if (mode === 'draw-band') {
    return 'Գոտի · 3 կտտոց՝ ձախ-վերև → աջ-վերև → ներքևի եզր։';
  }
  if (mode === 'auto-stack') {
    return `Ավտո հարկեր · 4 կտտոց՝ TL → TR → BR → BL (${entitiesCount} հարկ)։`;
  }
  if (mode === 'edit-polygon') {
    return 'Նարնջագույն կետերը քաշիր։ Եզրի + · նոր կետ ավելացնել։ Delete՝ ջնջել ընտրվածը։';
  }
  if (entitiesCount === 0) {
    return 'Նախ ստեղծիր/ընտրիր միավորը ձախ ցանկում, հետո Polygon գործիքով գծիր։';
  }
  if (!selectedId) {
    return 'Ընտրիր միավորը ձախ ցանկից, հետո սեղմիր Polygon և գծիր կետեր։';
  }
  if (toolPreset === 'floors') {
    return 'Արագ՝ Ավտո / Գոտի։ Խմբագրել · քաշել՝ ձևը ադապտացնելու համար։';
  }
  return 'Save-ից հետո հաջորդ կտտոցը սկսում է նոր գիծ (հինը մնում է)։ Խմբագրել · քաշել՝ ձևը փոխելու համար։';
};
