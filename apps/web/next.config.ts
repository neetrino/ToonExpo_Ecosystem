import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import {
  API_PROXY_TARGET_ENV,
  API_V1_PREFIX,
} from "./src/shared/config/api-proxy.constants";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const API_PROXY_REWRITE_SOURCE = `${API_V1_PREFIX}/:path*` as const;

const nextConfig: NextConfig = {
  transpilePackages: ["@toonexpo/contracts", "@toonexpo/shared"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
      },
    ],
  },
  async rewrites() {
    const apiProxyTarget = process.env[API_PROXY_TARGET_ENV]?.trim();

    if (!apiProxyTarget) {
      return [];
    }

    const origin = apiProxyTarget.replace(/\/$/, "");

    return [
      {
        source: API_PROXY_REWRITE_SOURCE,
        destination: `${origin}${API_V1_PREFIX}/:path*`,
      },
    ];
  },
};

export default withSentryConfig(withNextIntl(nextConfig), {
  silent: true,
  sourcemaps: {
    disable: true,
  },
});
