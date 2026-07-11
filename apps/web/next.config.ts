import { config as loadDotenv } from 'dotenv';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { resolve } from 'node:path';

import { loadWebEnv } from './src/lib/env';

// Secrets (AUTH_SECRET, AUTH_URL, DATABASE_URL) live in the monorepo ROOT .env.
// Next.js only auto-loads env files from the app directory, so we load the root
// file here (relative to apps/web) before the server reads configuration.
loadDotenv({ path: resolve(process.cwd(), '../../.env') });
loadWebEnv();

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
  transpilePackages: ['@toonexpo/ui', '@toonexpo/shared', '@toonexpo/contracts'],
};

export default withNextIntl(nextConfig);
