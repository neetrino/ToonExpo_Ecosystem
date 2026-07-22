import { config as loadEnv } from 'dotenv';
import { resolve } from 'node:path';

import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

import { API_PROXY_TARGET_ENV, API_V1_PREFIX } from './src/shared/config/api-proxy.constants';

// Load monorepo root env quietly (Next otherwise inherits root PORT and may bind wrong).
loadEnv({ path: resolve(process.cwd(), '../../.env.local'), quiet: true });
loadEnv({ path: resolve(process.cwd(), '../../.env'), quiet: true });
loadEnv({ path: resolve(process.cwd(), '.env.local'), quiet: true });
loadEnv({ path: resolve(process.cwd(), '.env'), quiet: true });

if (process.env['NODE_ENV'] !== 'production') {
  delete process.env['PORT'];
}

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const API_PROXY_REWRITE_SOURCE = `${API_V1_PREFIX}/:path*` as const;

const PLACEHOLD_REMOTE_PATTERN = {
  protocol: 'https' as const,
  hostname: 'placehold.co',
};

const resolveR2RemotePattern = ():
  { protocol: 'https' | 'http'; hostname: string; pathname?: string } | undefined => {
  const raw = process.env['R2_PUBLIC_URL']?.trim();
  if (!raw) {
    return undefined;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      return undefined;
    }

    return {
      protocol: url.protocol === 'https:' ? 'https' : 'http',
      hostname: url.hostname,
      pathname: '/**',
    };
  } catch {
    return undefined;
  }
};

const r2RemotePattern = resolveR2RemotePattern();

const nextConfig: NextConfig = {
  transpilePackages: ['@toonexpo/contracts', '@toonexpo/shared'],
  // Allow Next.js dev assets/HMR when opening the app via LAN IP (not only localhost).
  allowedDevOrigins: ['192.168.15.116'],
  images: {
    remotePatterns: [PLACEHOLD_REMOTE_PATTERN, ...(r2RemotePattern ? [r2RemotePattern] : [])],
    // Dev seed uses local SVG architecture placeholders under /public/demo.
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  async redirects() {
    return [
      {
        source: '/:locale/profile',
        destination: '/:locale/dashboard',
        permanent: true,
      },
      {
        source: '/:locale/profile/password',
        destination: '/:locale/settings',
        permanent: true,
      },
      {
        source: '/:locale/profile/:path*',
        destination: '/:locale/settings/:path*',
        permanent: true,
      },
      {
        source: '/:locale/settings/password',
        destination: '/:locale/settings',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const apiProxyTarget = process.env[API_PROXY_TARGET_ENV]?.trim();

    if (!apiProxyTarget) {
      return [];
    }

    const origin = apiProxyTarget.replace(/\/$/, '');

    return [
      {
        source: API_PROXY_REWRITE_SOURCE,
        destination: `${origin}${API_V1_PREFIX}/:path*`,
      },
    ];
  },
};

const baseConfig = withNextIntl(nextConfig);

/**
 * `withSentryConfig` injects experimental.clientTraceMetadata, which Next prints on
 * every `next dev` boot. Keep Sentry webpack wrap for production/CI builds only;
 * runtime SDK still initializes via instrumentation + sentry.*.config.ts.
 */
export default process.env['NODE_ENV'] === 'development'
  ? baseConfig
  : withSentryConfig(baseConfig, {
      silent: true,
      sourcemaps: {
        disable: true,
      },
    });
