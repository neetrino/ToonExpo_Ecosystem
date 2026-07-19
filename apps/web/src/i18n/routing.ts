import { defineRouting } from "next-intl/routing";
import { SUPPORTED_LOCALES } from "@toonexpo/shared";

import { WEB_DEFAULT_LOCALE } from "@/shared/config/constants";

/**
 * Locale routing shared by next-intl proxy and navigation helpers.
 * Default locale is Armenian (`hy`) for the public web shell.
 */
export const routing = defineRouting({
  locales: [...SUPPORTED_LOCALES],
  defaultLocale: WEB_DEFAULT_LOCALE,
  localePrefix: "always",
});
