import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { resolveSiteUrl } from '@/shared/config/site-url';

type RootLayoutProps = {
  children: ReactNode;
};

/**
 * Required App Router root layout. Locale shell owns `<html>` / `<body>`.
 * `metadataBase` lives here so root file-based OG/Twitter images
 * (`opengraph-image.png`, `twitter-image.png`) resolve to the public site
 * origin — not `PORT` from the monorepo API env (often 4000).
 */
export const metadata: Metadata = {
  metadataBase: new URL(resolveSiteUrl()),
};

export default function RootLayout({ children }: RootLayoutProps) {
  return children;
}
