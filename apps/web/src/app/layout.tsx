import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Montserrat } from 'next/font/google';
import localFont from 'next/font/local';
import { getLocale } from 'next-intl/server';

import { resolveSiteUrl } from '@/shared/config/site-url';

import { viewport } from './[locale]/viewport';
import './[locale]/globals.css';

export { viewport };

/**
 * Primary brand face (Toon Expo guideline) — Latin + Cyrillic.
 * Armenian glyphs come from Montserrat Arm in the CSS stack.
 */
const montserrat = Montserrat({
  subsets: ['latin', 'latin-ext', 'cyrillic', 'cyrillic-ext'],
  variable: '--font-montserrat',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

/**
 * Secondary brand face — Montserrat Armenian (Vahan Hovhannisyan extension).
 * Upstream ships Regular + Bold only; 500→Regular, 600/800→Bold aliases.
 */
const montserratArm = localFont({
  src: [
    {
      path: '../fonts/montserrat-arm/Montserrat_am3-Regular.woff',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/montserrat-arm/Montserrat_am3-Regular.woff',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../fonts/montserrat-arm/Montserrat_am3-Bold.woff',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../fonts/montserrat-arm/Montserrat_am3-Bold.woff',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../fonts/montserrat-arm/Montserrat_am3-Bold.woff',
      weight: '800',
      style: 'normal',
    },
  ],
  variable: '--font-montserrat-arm',
  display: 'swap',
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
      className={`${montserrat.variable} ${montserratArm.variable}`}
      // Chrome iOS injects autofill attrs (`__gcr*`) before hydrate — false mismatch in `next dev`.
      suppressHydrationWarning
    >
      <body className="min-h-full font-ui antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
