import type { ListboxOption } from '@/shared/ui/listbox-select';

export type MultiListboxSelectProps = {
  /** Empty array = All (no filter). */
  values: readonly string[];
  options: readonly ListboxOption[];
  onChange: (values: string[]) => void;
  allLabel: string;
  selectedCountLabel: (count: number) => string;
  'aria-label': string;
  className?: string | undefined;
  id?: string | undefined;
  disabled?: boolean | undefined;
  /** `plain` = hero search; `field` = bordered form control. */
  variant?: 'plain' | 'field' | undefined;
  /** `full` stretches; `fit` matches content width. */
  size?: 'full' | 'fit' | undefined;
  /**
   * When set with `variant="plain"`, renders the mobile hero filter block
   * (label + value) and collapses to the plain trigger on `lg+`.
   */
  heroBlock?:
    | {
        label: string;
      }
    | undefined;
};
