import { isAppLocale, SUPPORTED_LOCALES } from '@toonexpo/shared';
import { NextIntlClientProvider } from 'next-intl';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { notFound } from 'next/navigation';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import type { ReactNode } from 'react';

import { AppShellWithSession } from '@/components/app-shell-with-session';
import { SessionProvider } from '@/components/auth/session-provider';
import {
  isMortgagePageEnabled,
  loadPlatformContactSettings,
  resolveContactWithDefaults,
} from '@/lib/shared/platform-settings';
import { hasPublicVenueMap } from '@/lib/exhibition/venue-queries';

/** Nest is reached at request time; do not prerender against a live API. */
export const dynamic = 'force-dynamic';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-te-sans',
  display: 'swap',
});

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();
  const tFooter = await getTranslations('footer.contact');
  const contact = resolveContactWithDefaults(await loadPlatformContactSettings(), {
    email: tFooter('emailDefault'),
    phone: tFooter('phoneDefault'),
  });
  const [mortgagePageEnabled, exhibitionMapEnabled] = await Promise.all([
    isMortgagePageEnabled(),
    hasPublicVenueMap(),
  ]);

  return (
    <html lang={locale} className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <AppShellWithSession
              locale={locale}
              contactEmail={contact.email}
              contactPhone={contact.phone}
              mortgagePageEnabled={mortgagePageEnabled}
              exhibitionMapEnabled={exhibitionMapEnabled}
            >
              {children}
            </AppShellWithSession>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
