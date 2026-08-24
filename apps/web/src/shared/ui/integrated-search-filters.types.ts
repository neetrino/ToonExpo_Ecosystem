export type IntegratedSearchFilterOption = {
  value: string;
  label: string;
};

export type IntegratedSearchFilterConfig = {
  key: string;
  label: string;
  options: readonly IntegratedSearchFilterOption[];
  /** Label for the empty / “all” baseline option. */
  allOptionLabel: string;
  /** Combobox: type in the field to filter options. */
  searchable?: boolean | undefined;
  /** When this filter changes, draft values for these keys reset to “all”. */
  resetsKeys?: readonly string[] | undefined;
  /** Dependent cascade: field is not interactive until parent filter is set. */
  disabled?: boolean | undefined;
  /** Trigger text while disabled (e.g. “Select a building first”). */
  disabledPlaceholder?: string | undefined;
};

export type ActiveIntegratedFilterChip = {
  key: string;
  label: string;
};
