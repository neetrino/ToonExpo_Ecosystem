import type { ReactNode } from 'react';
import { Noto_Sans, Noto_Sans_Armenian, Outfit } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { QueryProvider } from '@/shared/providers/query-provider';

import './globals.css';

/**
 * UI face for Latin + Cyrillic. Armenian glyphs come from Noto Sans Armenian
 * in the same font stack so hy / ru / en share weight and rhythm.
 */
const notoSans = Noto_Sans({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-noto-sans',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const notoSansArmenian = Noto_Sans_Armenian({
  subsets: ['armenian'],
  variable: '--font-noto-sans-armenian',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

/** Brand / display — Latin-first; falls back to Noto for hy glyphs. */
const outfit = Outfit({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export const generateStaticParams = () => {
  return routing.locales.map((locale) => ({ locale }));
};

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${notoSans.variable} ${notoSansArmenian.variable} ${outfit.variable}`}
    >
      <body className="min-h-screen font-ui antialiased">
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>{children}</QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
