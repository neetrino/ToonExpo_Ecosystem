import type { ListSelectionApi } from '@/shared/hooks/use-list-selection';

/**
 * Selection props passed into inventory list tables (list view only).
 */
export type ListTableSelectionProps = {
  selection: ListSelectionApi;
  /** When set, only these row ids show an enabled checkbox (e.g. drafts). */
  selectableIdSet: ReadonlySet<string>;
};
