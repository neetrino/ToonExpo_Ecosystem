import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { PUBLIC_SITE_PAGE_KEYS, type PublicSitePages } from '@toonexpo/contracts';

import { getPublicSitePages } from '@/features/catalog/api/public-site-pages-api';
import { PublicSitePagesProvider } from '@/features/catalog/providers/public-site-pages-provider';
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

const defaultPublicSitePages = (): PublicSitePages => {
  const pages = {} as PublicSitePages;
  for (const key of PUBLIC_SITE_PAGE_KEYS) {
    pages[key] = true;
  }
  return pages;
};

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
  const { locale: urlLocale } = await params;

  if (!hasLocale(routing.locales, urlLocale)) {
    notFound();
  }

  // Always bind the root provider to the URL (public site) locale.
  // Portal routes nest their own provider for an independent panel UI language.
  // Using getLocale() here would leak panel language onto public pages when the
  // shared [locale] layout is reused across client navigations.
  setRequestLocale(urlLocale);
  const messages = (await import(`../../../messages/${urlLocale}.json`)).default;
  const sitePages = await getPublicSitePages()
    .then((response) => response.pages)
    .catch(() => defaultPublicSitePages());

  return (
    <NextIntlClientProvider locale={urlLocale} messages={messages}>
      <QueryProvider>
        <PublicSitePagesProvider pages={sitePages}>
          <PublicChrome>{children}</PublicChrome>
        </PublicSitePagesProvider>
      </QueryProvider>
    </NextIntlClientProvider>
  );
}
