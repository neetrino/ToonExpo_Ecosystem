import { isSupportedLocale, type SupportedLocale } from '@toonexpo/shared';
import { cookies } from 'next/headers';
import type { AbstractIntlMessages } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { PanelIntlClientProvider } from '@/shared/i18n/panel-intl-client-provider';
import { PANEL_LOCALE_COOKIE, parsePanelLocaleCookie } from '@/shared/i18n/panel-locale';

type PanelIntlProviderProps = {
  /** Locale from the URL (`[locale]` segment) — public site language. */
  urlLocale: string;
  children: ReactNode;
};

const loadMessages = async (locale: SupportedLocale): Promise<AbstractIntlMessages> => {
  switch (locale) {
    case 'hy':
      return (await import('../../../messages/hy.json')).default;
    case 'ru':
      return (await import('../../../messages/ru.json')).default;
    case 'en':
      return (await import('../../../messages/en.json')).default;
  }
};

/**
 * Resolves portal UI locale from cookie, falling back to the URL (site) locale.
 */
export const resolvePanelLocale = async (urlLocale: string): Promise<SupportedLocale> => {
  const cookieStore = await cookies();
  const fromCookie = parsePanelLocaleCookie(cookieStore.get(PANEL_LOCALE_COOKIE)?.value);
  if (fromCookie) {
    return fromCookie;
  }
  if (isSupportedLocale(urlLocale)) {
    return urlLocale;
  }
  return 'en';
};

/**
 * Nested intl provider for admin/builder/partner.
 * Messages follow the panel cookie; routing locale stays on the URL so links
 * back to the public site do not switch the site language.
 */
export const PanelIntlProvider = async ({ urlLocale, children }: PanelIntlProviderProps) => {
  const panelLocale = await resolvePanelLocale(urlLocale);
  const routingLocale: SupportedLocale = isSupportedLocale(urlLocale) ? urlLocale : 'en';
  setRequestLocale(panelLocale);
  const messages = await loadMessages(panelLocale);

  return (
    <PanelIntlClientProvider
      urlLocale={routingLocale}
      panelLocale={panelLocale}
      messages={messages}
    >
      {children}
    </PanelIntlClientProvider>
  );
};
