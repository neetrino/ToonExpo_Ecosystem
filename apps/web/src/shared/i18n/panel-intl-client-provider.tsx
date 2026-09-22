'use client';

import type { SupportedLocale } from '@toonexpo/shared';
import type { AbstractIntlMessages } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';
import { createContext, useContext, type ReactNode } from 'react';

const PanelLocaleContext = createContext<SupportedLocale | null>(null);

/**
 * Panel UI language from the nested portal provider (cookie), not the URL locale.
 */
export const usePanelLocale = (): SupportedLocale | null => useContext(PanelLocaleContext);

type PanelIntlClientProviderProps = {
  /** URL / routing locale — keeps Link and router on the public site language. */
  urlLocale: SupportedLocale;
  /** Portal UI language from the panel cookie. */
  panelLocale: SupportedLocale;
  messages: AbstractIntlMessages;
  children: ReactNode;
};

/**
 * Client bridge: panel messages for UI, URL locale for next-intl navigation.
 * Using `locale={panelLocale}` would rewrite public links to the panel language.
 */
export const PanelIntlClientProvider = ({
  urlLocale,
  panelLocale,
  messages,
  children,
}: PanelIntlClientProviderProps) => {
  return (
    <PanelLocaleContext.Provider value={panelLocale}>
      <NextIntlClientProvider locale={urlLocale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </PanelLocaleContext.Provider>
  );
};
