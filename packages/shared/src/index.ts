/**
 * Supported UI locales for ToonExpo (Armenian, Russian, English).
 */
export const SUPPORTED_LOCALES = ["hy", "ru", "en"] as const;

/**
 * Locale code used when no preference is available.
 */
export const DEFAULT_LOCALE = "en" as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number];

/**
 * Returns true when the value is a supported locale code.
 */
export const isSupportedLocale = (value: string): value is SupportedLocale => {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
};
