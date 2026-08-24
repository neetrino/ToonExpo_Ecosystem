export type TranslationContentLocale = 'hy' | 'ru' | 'en';

export type FlatFieldError = {
  path: string;
  type: string;
  message: string;
};

export type FormErrorMessageKind =
  | { kind: 'generic' }
  | { kind: 'raw'; message: string }
  | { kind: 'required'; field: string }
  | { kind: 'requiredInLanguage'; field: string; language: TranslationContentLocale }
  | { kind: 'tooLong'; field: string }
  | { kind: 'invalid'; field: string };

const LOCALE_SUFFIXES = [
  { suffix: 'Hy', locale: 'hy' },
  { suffix: 'Ru', locale: 'ru' },
  { suffix: 'En', locale: 'en' },
] as const;

const REQUIRED_TYPES = new Set(['too_small', 'required', 'invalid_type']);
const TOO_LONG_TYPES = new Set(['too_big']);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

/**
 * Maps `nameHy` / nested `foo.nameEn` paths to the translation locale suffix.
 */
export const splitTranslationField = (
  path: string,
): { basePath: string; locale: TranslationContentLocale | null } => {
  const leaf = path.includes('.') ? (path.split('.').pop() ?? path) : path;
  for (const { suffix, locale } of LOCALE_SUFFIXES) {
    if (leaf.endsWith(suffix) && leaf.length > suffix.length) {
      return { basePath: leaf.slice(0, -suffix.length), locale };
    }
  }
  return { basePath: leaf, locale: null };
};

const isLeafFieldError = (
  value: Record<string, unknown>,
): value is Record<string, unknown> & { type: string } => typeof value['type'] === 'string';

/**
 * Flattens react-hook-form / zod error trees into leaf field errors.
 */
export const flattenFieldErrors = (errors: object, parentPath = ''): FlatFieldError[] => {
  const result: FlatFieldError[] = [];

  for (const [key, value] of Object.entries(errors)) {
    if (value === undefined || value === null) {
      continue;
    }
    const path = parentPath.length > 0 ? `${parentPath}.${key}` : key;
    if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (isRecord(item) || Array.isArray(item)) {
          result.push(...flattenFieldErrors(item as object, `${path}.${index}`));
        }
      });
      continue;
    }
    if (!isRecord(value)) {
      continue;
    }
    if (isLeafFieldError(value)) {
      result.push({
        path,
        type: value['type'],
        message: typeof value['message'] === 'string' ? value['message'] : '',
      });
      continue;
    }
    result.push(...flattenFieldErrors(value, path));
  }

  return result;
};

export const getFirstErrorTranslationLocale = (
  errors: object,
): TranslationContentLocale | null => {
  const first = flattenFieldErrors(errors)[0];
  return first ? splitTranslationField(first.path).locale : null;
};

/**
 * Picks a stable, user-facing error kind from the first form field error.
 */
export const describeFirstFormError = (
  errors: object,
  fieldLabels: Record<string, string>,
): FormErrorMessageKind => {
  const first = flattenFieldErrors(errors)[0];
  if (!first) {
    return { kind: 'generic' };
  }
  if (first.path === 'root' && first.message.length > 0) {
    return { kind: 'raw', message: first.message };
  }

  const { basePath, locale } = splitTranslationField(first.path);
  const field = fieldLabels[first.path] ?? fieldLabels[basePath];
  if (!field) {
    return { kind: 'generic' };
  }
  if (REQUIRED_TYPES.has(first.type) && locale) {
    return { kind: 'requiredInLanguage', field, language: locale };
  }
  if (REQUIRED_TYPES.has(first.type)) {
    return { kind: 'required', field };
  }
  if (TOO_LONG_TYPES.has(first.type)) {
    return { kind: 'tooLong', field };
  }
  return { kind: 'invalid', field };
};
