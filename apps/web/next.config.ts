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

/** Allow any Cloudflare R2 public-dev host (`pub-*.r2.dev`) without relying on build env. */
const R2_DEV_REMOTE_PATTERN = {
  protocol: 'https' as const,
  hostname: '*.r2.dev',
  pathname: '/**',
};

type ImageRemotePattern = {
  protocol: 'https' | 'http';
  hostname: string;
  pathname?: string;
};

const resolveConfiguredRemotePattern = (
  rawUrl: string | undefined,
): ImageRemotePattern | undefined => {
  const raw = rawUrl?.trim();
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

/**
 * R2 / CDN hosts for `next/image`. Prefer env (`R2_PUBLIC_URL` / `NEXT_PUBLIC_R2_PUBLIC_URL`)
 * for custom domains; always allow `*.r2.dev` so Turbo cache misses do not break prod images.
 */
const resolveImageRemotePatterns = (): ImageRemotePattern[] => {
  const fromEnv =
    resolveConfiguredRemotePattern(process.env['R2_PUBLIC_URL']) ??
    resolveConfiguredRemotePattern(process.env['NEXT_PUBLIC_R2_PUBLIC_URL']);

  const patterns: ImageRemotePattern[] = [PLACEHOLD_REMOTE_PATTERN, R2_DEV_REMOTE_PATTERN];
  if (
    fromEnv &&
    fromEnv.hostname !== R2_DEV_REMOTE_PATTERN.hostname &&
    !fromEnv.hostname.endsWith('.r2.dev')
  ) {
    patterns.push(fromEnv);
  }

  return patterns;
};

/**
 * LAN hosts for `next dev` on a phone (not DevTools). IP changes with Wi‑Fi —
 * override via `ALLOWED_DEV_ORIGINS=192.168.x.x,other` in `.env.local`.
 */
const resolveAllowedDevOrigins = (): string[] => {
  const fromEnv = process.env['ALLOWED_DEV_ORIGINS']
    ?.split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin.length > 0);

  if (fromEnv && fromEnv.length > 0) {
    return fromEnv;
  }

  return ['192.168.15.126'];
};

const nextConfig: NextConfig = {
  transpilePackages: ['@toonexpo/contracts', '@toonexpo/shared'],
  // Allow Next.js dev assets/HMR when opening the app via LAN IP (not only localhost).
  allowedDevOrigins: resolveAllowedDevOrigins(),
  images: {
    remotePatterns: resolveImageRemotePatterns(),
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
        source: '/:locale/profile/qr',
        destination: '/:locale/qr',
        permanent: true,
      },
      {
        source: '/:locale/profile/favorites',
        destination: '/:locale/favorites',
        permanent: true,
      },
      {
        source: '/:locale/profile/requests',
        destination: '/:locale/requests',
        permanent: true,
      },
      {
        source: '/:locale/profile/checkin',
        destination: '/:locale/checkin',
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
      {
        source: '/:locale/settings/qr',
        destination: '/:locale/qr',
        permanent: false,
      },
      {
        source: '/:locale/settings/favorites',
        destination: '/:locale/favorites',
        permanent: false,
      },
      {
        source: '/:locale/settings/requests',
        destination: '/:locale/requests',
        permanent: false,
      },
      {
        source: '/:locale/settings/checkin',
        destination: '/:locale/checkin',
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const rewrites: { source: string; destination: string }[] = [];

    // Same-origin proxy for R2 assets (GLBs need CORS-safe fetch for deck.gl).
    const r2PublicUrl =
      process.env['NEXT_PUBLIC_R2_PUBLIC_URL']?.trim() || process.env['R2_PUBLIC_URL']?.trim();
    if (r2PublicUrl) {
      const r2Origin = r2PublicUrl.replace(/\/$/, '');
      rewrites.push({
        source: '/r2-proxy/:path*',
        destination: `${r2Origin}/:path*`,
      });
    }

    const apiProxyTarget = process.env[API_PROXY_TARGET_ENV]?.trim();
    if (apiProxyTarget) {
      const origin = apiProxyTarget.replace(/\/$/, '');
      rewrites.push({
        source: API_PROXY_REWRITE_SOURCE,
        destination: `${origin}${API_V1_PREFIX}/:path*`,
      });
    }

    return rewrites;
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
