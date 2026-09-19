import type { HomeHeroCopy, LocaleTextMap } from '@toonexpo/contracts';
import { isSupportedLocale, SUPPORTED_LOCALES } from '@toonexpo/shared';

import {
  HOME_HERO_SUBTITLE_MAX_LENGTH,
  HOME_HERO_TITLE_MAX_LENGTH,
} from '../platform-settings.constants.js';

const emptyCopy = (): HomeHeroCopy => ({ title: {}, subtitle: {} });

/**
 * Parses stored `home.hero.copy` JSON. Invalid or empty payloads become empty maps.
 */
export const parseHomeHeroCopy = (raw: string | undefined): HomeHeroCopy => {
  if (!raw?.trim()) {
    return emptyCopy();
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) {
      return emptyCopy();
    }

    return {
      title: normalizeLocaleMap(parsed['title'], HOME_HERO_TITLE_MAX_LENGTH),
      subtitle: normalizeLocaleMap(parsed['subtitle'], HOME_HERO_SUBTITLE_MAX_LENGTH),
    };
  } catch {
    return emptyCopy();
  }
};

/**
 * Trims, drops empty locales, and caps length for a PATCH payload.
 */
export const normalizeHomeHeroCopy = (copy: HomeHeroCopy): HomeHeroCopy => ({
  title: normalizeLocaleMap(copy.title, HOME_HERO_TITLE_MAX_LENGTH),
  subtitle: normalizeLocaleMap(copy.subtitle, HOME_HERO_SUBTITLE_MAX_LENGTH),
});

export const isHomeHeroCopyEmpty = (copy: HomeHeroCopy): boolean =>
  Object.keys(copy.title).length === 0 && Object.keys(copy.subtitle).length === 0;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const normalizeLocaleMap = (value: unknown, maxLength: number): LocaleTextMap => {
  if (!isRecord(value)) {
    return {};
  }

  const map: LocaleTextMap = {};
  for (const locale of SUPPORTED_LOCALES) {
    const entry = value[locale];
    if (typeof entry !== 'string') {
      continue;
    }
    const trimmed = entry.trim().slice(0, maxLength);
    if (!trimmed) {
      continue;
    }
    if (isSupportedLocale(locale)) {
      map[locale] = trimmed;
    }
  }
  return map;
};
