export const VIEW_MODE_LIST = 'list' as const;
export const VIEW_MODE_CARDS = 'cards' as const;

export type ViewMode = typeof VIEW_MODE_LIST | typeof VIEW_MODE_CARDS;

export const isViewMode = (value: string | null): value is ViewMode =>
  value === VIEW_MODE_LIST || value === VIEW_MODE_CARDS;
