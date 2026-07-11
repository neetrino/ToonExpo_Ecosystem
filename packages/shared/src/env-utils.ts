export function emptyToUndefined(value: unknown): unknown {
  return value === '' || value === undefined ? undefined : value;
}
