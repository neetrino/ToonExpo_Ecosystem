import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Manrope, Noto_Sans, Noto_Sans_Armenian, Outfit } from 'next/font/google';
import { getLocale } from 'next-intl/server';

import { resolveSiteUrl } from '@/shared/config/site-url';

import { viewport } from './[locale]/viewport';
import './[locale]/globals.css';

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

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * App Router root layout — must own `<html>` / `<body>` (Next.js 16).
 * `metadataBase` lives here so root file-based OG/Twitter images
 * (`opengraph-image.png`, `twitter-image.png`) resolve to the public site
 * origin — not `PORT` from the monorepo API env (often 4000).
 */
export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      className={`${manrope.variable} ${notoSans.variable} ${notoSansArmenian.variable} ${outfit.variable}`}
      // Chrome iOS injects autofill attrs (`__gcr*`) before hydrate — false mismatch in `next dev`.
      suppressHydrationWarning
    >
      <body className="min-h-full font-ui antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
