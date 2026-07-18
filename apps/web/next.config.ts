import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

import {
  API_PROXY_TARGET_ENV,
  API_V1_PREFIX,
} from "./src/shared/config/api-proxy.constants";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const API_PROXY_REWRITE_SOURCE = `${API_V1_PREFIX}/:path*` as const;

const PLACEHOLD_REMOTE_PATTERN = {
  protocol: "https" as const,
  hostname: "placehold.co",
};

const resolveR2RemotePattern = ():
  | { protocol: "https" | "http"; hostname: string; pathname?: string }
  | undefined => {
  const raw = process.env["R2_PUBLIC_URL"]?.trim();
  if (!raw) {
    return undefined;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return undefined;
    }

    return {
      protocol: url.protocol === "https:" ? "https" : "http",
      hostname: url.hostname,
      pathname: "/**",
    };
  } catch {
    return undefined;
  }
};

const r2RemotePattern = resolveR2RemotePattern();

const nextConfig: NextConfig = {
  transpilePackages: ["@toonexpo/contracts", "@toonexpo/shared"],
  images: {
    remotePatterns: [
      PLACEHOLD_REMOTE_PATTERN,
      ...(r2RemotePattern ? [r2RemotePattern] : []),
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
