import type { ListboxOption } from '@/shared/ui/listbox-select-menu';

const MAX_INLINE_SELECTED_LABELS = 3;

export const resolveListboxTriggerLabel = (
  options: readonly ListboxOption[],
  selectedIds: readonly string[],
  placeholder: string | undefined,
  selectedCountLabel: ((count: number) => string) | undefined,
): { label: string; isPlaceholder: boolean } => {
  if (selectedIds.length === 0) {
    return {
      label: placeholder ?? options[0]?.label ?? '',
      isPlaceholder: Boolean(placeholder),
    };
  }

  const labels = selectedIds
    .map((id) => options.find((option) => option.value === id)?.label)
    .filter((label): label is string => label != null);

  if (labels.length === 1 && labels[0]) {
    return { label: labels[0], isPlaceholder: false };
  }
  if (labels.length > 0 && labels.length <= MAX_INLINE_SELECTED_LABELS) {
    return { label: labels.join(', '), isPlaceholder: false };
  }
  if (selectedCountLabel) {
    return { label: selectedCountLabel(selectedIds.length), isPlaceholder: false };
  }
  return { label: labels.join(', '), isPlaceholder: false };
};
