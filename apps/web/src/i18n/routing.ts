import { defineRouting } from 'next-intl/routing';
import { SUPPORTED_LOCALES } from '@toonexpo/shared';

import { WEB_DEFAULT_LOCALE } from '@/shared/config/constants';

/**
 * Locale routing shared by next-intl proxy and navigation helpers.
 * Default locale is English (`en`) for the public web shell.
 * Locale detection is off so first visit always lands on English.
 */
export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: WEB_DEFAULT_LOCALE,
  localePrefix: 'always',
  localeDetection: false,
});
