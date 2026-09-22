import type { LocaleTextMap } from '@toonexpo/contracts';
import { isSupportedLocale } from '@toonexpo/shared';

/**
 * Picks CMS hero copy for the active locale only (no cross-language fallback).
 */
export const pickHomeHeroCopy = (
  map: LocaleTextMap | undefined,
  locale: string,
  fallback: string,
): string => {
  if (!isSupportedLocale(locale)) {
    return fallback;
  }

  const value = map?.[locale]?.trim();
  return value && value.length > 0 ? value : fallback;
};
