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
};

export type ActiveIntegratedFilterChip = {
  key: string;
  label: string;
};
