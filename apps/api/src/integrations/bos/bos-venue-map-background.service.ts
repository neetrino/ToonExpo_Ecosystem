import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { VenueMapSnapshotBackground } from "@toonexpo/contracts";

import { NODE_ENV_PRODUCTION } from "../../common/constants/app.constants.js";
import type { AppEnv } from "../../config/env.validation.js";
import { MEDIA_ALLOWED_MIME_TYPES } from "../../media/media.constants.js";
import { MediaUploadService } from "../../media/media-upload.service.js";
import {
  BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE,
  BOS_VENUE_MAP_BACKGROUND_FETCH_TIMEOUT_MS,
  BOS_VENUE_MAP_MEDIA_ENTITY_TYPE,
} from "../integrations.constants.js";

const PRIVATE_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const PRIVATE_IPV4_PATTERN =
  /^(10\.|127\.|169\.254\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)/;

export type IngestedVenueBackground = {
  mediaAssetId: string;
};

/**
 * Copies a BOS background image into ToonExpo R2 so public reads never depend on BOS URLs.
 */
@Injectable()
export class BosVenueMapBackgroundService {
  private readonly logger = new Logger(BosVenueMapBackgroundService.name);

  constructor(
    private readonly mediaUpload: MediaUploadService,
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  async ingest(
    background: VenueMapSnapshotBackground,
    bosVenuePlanId: string,
  ): Promise<IngestedVenueBackground> {
    const sourceUrl = parseBackgroundUrl(background.url);
    this.assertUrlAllowed(sourceUrl);

    const downloaded = await this.downloadImage(sourceUrl);
    const mimeType = sniffImageMime(downloaded.buffer, downloaded.contentType);
    const asset = await this.mediaUpload.upload({
      buffer: downloaded.buffer,
      mimeType,
      originalFilename: `bos-venue-map-${bosVenuePlanId}`,
      scope: { kind: "platform" },
      relatedEntityType: BOS_VENUE_MAP_MEDIA_ENTITY_TYPE,
      relatedEntityId: bosVenuePlanId,
    });

    return { mediaAssetId: asset.id };
  }

  private assertUrlAllowed(sourceUrl: URL): void {
    const nodeEnv = this.configService.get("NODE_ENV", { infer: true });
    if (nodeEnv !== NODE_ENV_PRODUCTION) {
      return;
    }

    const hostname = sourceUrl.hostname.toLowerCase();
    if (PRIVATE_HOSTS.has(hostname) || PRIVATE_IPV4_PATTERN.test(hostname)) {
      throw new Error(BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE);
    }
  }

  private async downloadImage(
    sourceUrl: URL,
  ): Promise<{ buffer: Buffer; contentType: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      BOS_VENUE_MAP_BACKGROUND_FETCH_TIMEOUT_MS,
    );

    try {
      const response = await fetch(sourceUrl, { signal: controller.signal });
      if (!response.ok) {
        throw new Error(BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE);
      }
      return {
        buffer: Buffer.from(await response.arrayBuffer()),
        contentType: response.headers.get("content-type") ?? "application/octet-stream",
      };
    } catch (error) {
      this.logger.error({ err: error, url: sourceUrl.origin }, "BOS background fetch failed");
      throw new Error(BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE);
    } finally {
      clearTimeout(timeout);
    }
  }
}

const parseBackgroundUrl = (raw: string): URL => {
  try {
    return new URL(raw);
  } catch {
    throw new Error(BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE);
  }
};

const sniffImageMime = (buffer: Buffer, headerMime: string): string => {
  const normalized = headerMime.split(";")[0]?.trim().toLowerCase() ?? "";
  if ((MEDIA_ALLOWED_MIME_TYPES as readonly string[]).includes(normalized)) {
    return normalized;
  }
  if (buffer[0] === 0xff && buffer[1] === 0xd8) {
    return "image/jpeg";
  }
  if (buffer[0] === 0x89 && buffer[1] === 0x50) {
    return "image/png";
  }
  if (buffer[0] === 0x52 && buffer[1] === 0x49) {
    return "image/webp";
  }
  throw new Error(BOS_VENUE_MAP_BACKGROUND_FAILED_MESSAGE);
};
