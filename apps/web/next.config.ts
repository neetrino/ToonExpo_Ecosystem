import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { resolve } from 'node:path';

import { loadWebEnv } from './src/lib/env';

// Secrets (AUTH_SECRET, AUTH_URL, DATABASE_URL) live in the monorepo ROOT .env.
// Next.js only auto-loads env files from the app directory, so we load the root
// file here (relative to apps/web) before the server reads configuration.
loadDotenv({ path: resolve(process.cwd(), '../../.env') });
const webEnv = loadWebEnv();

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nestProxyDestination = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

const nextConfig: NextConfig = {
  transpilePackages: ['@toonexpo/ui', '@toonexpo/shared', '@toonexpo/contracts'],
  images: {
    // v1 remote URLs (e.g. seed picsum); replace with media-upload pipeline later.
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
  },
  /**
   * Same-origin reverse proxy to Nest so httpOnly session cookies stay on the
   * web host (required for RSC session reads). No business logic here.
   */
  async rewrites() {
    return [
      {
        source: '/nest/:path*',
        destination: `${nestProxyDestination}/:path*`,
      },
    ];
  },
};

// Touch validated env so misconfiguration fails at boot.
void webEnv.NEXT_PUBLIC_API_URL;

export default withNextIntl(nextConfig);
