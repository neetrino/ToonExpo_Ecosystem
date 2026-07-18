import type { ConfigService } from "@nestjs/config";

import type { AppEnv } from "../config/env.validation.js";

/**
 * True when all Cloudflare R2 env vars required for uploads are present.
 */
export const isR2Configured = (
  env: Pick<
    AppEnv,
    | "R2_ACCOUNT_ID"
    | "R2_ACCESS_KEY_ID"
    | "R2_SECRET_ACCESS_KEY"
    | "R2_BUCKET_NAME"
    | "R2_PUBLIC_URL"
  >,
): boolean =>
  Boolean(
    env.R2_ACCOUNT_ID &&
      env.R2_ACCESS_KEY_ID &&
      env.R2_SECRET_ACCESS_KEY &&
      env.R2_BUCKET_NAME &&
      env.R2_PUBLIC_URL,
  );

export const isR2ConfiguredFromService = (
  configService: ConfigService<AppEnv, true>,
): boolean =>
  isR2Configured({
    R2_ACCOUNT_ID: configService.get("R2_ACCOUNT_ID", { infer: true }),
    R2_ACCESS_KEY_ID: configService.get("R2_ACCESS_KEY_ID", { infer: true }),
    R2_SECRET_ACCESS_KEY: configService.get("R2_SECRET_ACCESS_KEY", {
      infer: true,
    }),
    R2_BUCKET_NAME: configService.get("R2_BUCKET_NAME", { infer: true }),
    R2_PUBLIC_URL: configService.get("R2_PUBLIC_URL", { infer: true }),
  });

export const buildR2Endpoint = (accountId: string): string =>
  `https://${accountId}.r2.cloudflarestorage.com`;

export const buildObjectKey = (
  scope: "company" | "platform",
  assetId: string,
  extension: string,
  companyId?: string,
): string => {
  if (scope === "company") {
    if (!companyId) {
      throw new Error("companyId is required for company-scoped media");
    }
    return `companies/${companyId}/${assetId}.${extension}`;
  }

  return `platform/${assetId}.${extension}`;
};

export const buildPublicFileUrl = (publicBaseUrl: string, key: string): string => {
  const base = publicBaseUrl.replace(/\/$/, "");
  return `${base}/${key}`;
};

export const sanitizeOriginalFilename = (filename: string): string => {
  const baseName = filename.split(/[/\\]/).pop() ?? "upload";
  const trimmed = baseName.trim().slice(0, 200);
  return trimmed.length > 0 ? trimmed : "upload";
};
