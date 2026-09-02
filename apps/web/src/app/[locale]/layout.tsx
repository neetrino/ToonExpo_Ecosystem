import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { routing } from '@/i18n/routing';
import { resolveSiteUrl } from '@/shared/config/site-url';
import { QueryProvider } from '@/shared/providers/query-provider';
import { PublicChrome } from '@/shared/ui/public-chrome';

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

const SITE_NAME = 'TOONEXPO';
const SITE_DESCRIPTION =
  'The marketplace for verified homes, new developments, and partner bank offers.';
/** Public share card — new path so messenger OG caches do not keep the old house mark. */
const SHARE_IMAGE_PATH = '/brand/og-share.png';
const SHARE_IMAGE_WIDTH = 1200;
const SHARE_IMAGE_HEIGHT = 630;

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
          url: SHARE_IMAGE_PATH,
          width: SHARE_IMAGE_WIDTH,
          height: SHARE_IMAGE_HEIGHT,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: SITE_NAME,
      description: SITE_DESCRIPTION,
      images: [SHARE_IMAGE_PATH],
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
    <NextIntlClientProvider messages={messages}>
      <QueryProvider>
        <PublicChrome>{children}</PublicChrome>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
