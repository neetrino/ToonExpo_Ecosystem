import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope, Noto_Sans, Noto_Sans_Armenian, Outfit } from 'next/font/google';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { resolveSiteUrl } from '@/shared/config/site-url';
import { QueryProvider } from '@/shared/providers/query-provider';
import { PublicChrome } from '@/shared/ui/public-chrome';

import { viewport } from './viewport';
import './globals.css';

export { viewport };

/**
 * Refined UI face for Latin + Cyrillic. Armenian glyphs come from Noto Sans Armenian.
 */
const manrope = Manrope({
  subsets: ['latin', 'latin-ext', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

/** Fallback UI face — full Cyrillic / extended coverage. */
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

/** Brand / display — expressive headlines; falls back to Noto for hy glyphs. */
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

const SITE_NAME = 'TOONEXPO';
const SITE_DESCRIPTION =
  'The marketplace for verified homes, new developments, and partner bank offers.';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> => {
  const { locale } = await params;
  const siteUrl = resolveSiteUrl();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: SITE_NAME,
      template: `%s · ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/icon.png', type: 'image/png', sizes: '32x32' },
      ],
      apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
      shortcut: ['/favicon.ico'],
    },
    openGraph: {
      type: 'website',
      locale: locale === 'hy' ? 'hy_AM' : locale === 'ru' ? 'ru_RU' : 'en_US',
      siteName: SITE_NAME,
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      url: siteUrl,
      images: [
        {
          url: '/opengraph-image.png',
          width: 1200,
          height: 630,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: ['/twitter-image.png'],
    },
  };
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
      className={`${manrope.variable} ${notoSans.variable} ${notoSansArmenian.variable} ${outfit.variable}`}
      // Chrome iOS injects autofill attrs (`__gcr*`) before hydrate — false mismatch in `next dev`.
      suppressHydrationWarning
    >
      <body className="min-h-full font-ui antialiased" suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <PublicChrome>{children}</PublicChrome>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
