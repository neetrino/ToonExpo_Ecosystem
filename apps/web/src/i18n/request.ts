import { hasLocale } from 'next-intl';
import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';

import { routing } from './routing';
import {
  isPanelPathname,
  PANEL_LOCALE_COOKIE,
  parsePanelLocaleCookie,
} from '@/shared/i18n/panel-locale';

/**
 * Request-scoped i18n config.
 * On portal routes, server translations follow the panel language cookie.
 * The root client provider always stays on the URL (site) locale — portals
 * nest their own provider so public pages never inherit panel language.
 */
export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const urlLocale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  const headerStore = await headers();
  const pathname = headerStore.get('x-pathname') ?? '';
  const cookieStore = await cookies();
  const panelLocale = parsePanelLocaleCookie(cookieStore.get(PANEL_LOCALE_COOKIE)?.value);

  const locale =
    pathname.length > 0 && isPanelPathname(pathname) && panelLocale
      ? panelLocale
      : urlLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
