import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  PUBLIC_CACHE_TAG,
  catalogProjectCacheTag,
  type PublicCacheTag,
} from "@toonexpo/shared";

import {
  WEB_REVALIDATE_SECRET_HEADER,
  WEB_REVALIDATE_TIMEOUT_MS,
} from "../constants/app.constants.js";
import type { AppEnv } from "../../config/env.validation.js";

export {
  PUBLIC_CACHE_TAG,
  catalogProjectCacheTag,
} from "@toonexpo/shared";

export type WebRevalidateTag = PublicCacheTag | string;

/**
 * Fire-and-forget purge of Next.js Data Cache tags after publish mutations.
 * No-ops when WEB_REVALIDATE_URL / WEB_REVALIDATE_SECRET are unset (TTL-only).
 */
@Injectable()
export class WebRevalidationService {
  private readonly logger = new Logger(WebRevalidationService.name);

  constructor(
    private readonly configService: ConfigService<AppEnv, true>,
  ) {}

  /**
   * Schedules a non-blocking revalidation POST. Never throws to callers.
   */
  revalidateTags(tags: WebRevalidateTag[]): void {
    const unique = [
      ...new Set(tags.map((tag) => tag.trim()).filter((tag) => tag.length > 0)),
    ];
    if (unique.length === 0) {
      return;
    }

    void this.postTags(unique);
  }

  revalidateCatalog(projectId?: string): void {
    const tags: WebRevalidateTag[] = [PUBLIC_CACHE_TAG.CATALOG];
    if (projectId) {
      tags.push(catalogProjectCacheTag(projectId));
    }
    this.revalidateTags(tags);
  }

  revalidatePartners(): void {
    this.revalidateTags([PUBLIC_CACHE_TAG.PARTNERS]);
  }

  revalidateMortgage(): void {
    this.revalidateTags([PUBLIC_CACHE_TAG.MORTGAGE]);
  }

  revalidateExhibition(): void {
    this.revalidateTags([PUBLIC_CACHE_TAG.EXHIBITION]);
  }

  revalidateVisualMap(): void {
    this.revalidateTags([PUBLIC_CACHE_TAG.VISUAL_MAP]);
  }

  private async postTags(tags: string[]): Promise<void> {
    const url = this.configService.get("WEB_REVALIDATE_URL", { infer: true });
    const secret = this.configService.get("WEB_REVALIDATE_SECRET", {
      infer: true,
    });

    if (!url || !secret) {
      this.logger.debug(
        `Web revalidation skipped (env unset); tags=${tags.join(",")}`,
      );
      return;
    }

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      WEB_REVALIDATE_TIMEOUT_MS,
    );

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          [WEB_REVALIDATE_SECRET_HEADER]: secret,
        },
        body: JSON.stringify({ tags }),
        signal: controller.signal,
      });

      if (!response.ok) {
        this.logger.warn(
          `Web revalidation failed status=${response.status} tags=${tags.join(",")}`,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      this.logger.warn(
        `Web revalidation error: ${message}; tags=${tags.join(",")}`,
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
