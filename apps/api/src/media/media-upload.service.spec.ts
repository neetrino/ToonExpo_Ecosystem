import {
  BadRequestException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MediaAssetType } from "@toonexpo/db";

import type { PrismaService } from "../prisma/prisma.service.js";
import { MediaUploadService } from "./media-upload.service.js";
import type { R2StorageClient } from "./media.types.js";

describe("MediaUploadService", () => {
  const mediaAssetCreate = vi.fn();
  const mediaAssetUpdate = vi.fn();
  const mediaAssetDelete = vi.fn();
  const mediaAssetCount = vi.fn();
  const mediaAssetFindMany = vi.fn();
  const uploadObject = vi.fn();
  const get = vi.fn();

  let service: MediaUploadService;
  let r2Storage: R2StorageClient;

  const pngBuffer = Buffer.from(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001000d0a2db40000000049454e44ae426082",
    "hex",
  );

  beforeEach(() => {
    vi.clearAllMocks();
    get.mockImplementation((key: string) => {
      const values: Record<string, string> = {
        R2_ACCOUNT_ID: "acct",
        R2_ACCESS_KEY_ID: "key",
        R2_SECRET_ACCESS_KEY: "secret",
        R2_BUCKET_NAME: "bucket",
        R2_PUBLIC_URL: "https://cdn.example.com",
      };
      return values[key];
    });

    r2Storage = { uploadObject, deleteObject: vi.fn() };
    service = new MediaUploadService(
      {
        db: {
          mediaAsset: {
            create: mediaAssetCreate,
            update: mediaAssetUpdate,
            delete: mediaAssetDelete,
            count: mediaAssetCount,
            findMany: mediaAssetFindMany,
          },
        },
      } as unknown as PrismaService,
      { get } as unknown as ConfigService,
      r2Storage,
    );
  });

  it("returns 503 when R2 is not configured", () => {
    const unconfigured = new MediaUploadService(
      {
        db: { mediaAsset: {} },
      } as unknown as PrismaService,
      {
        get: vi.fn().mockReturnValue(undefined),
      } as unknown as ConfigService,
      null,
    );

    expect(() => unconfigured.assertConfigured()).toThrow(
      ServiceUnavailableException,
    );
  });

  it("rejects unsupported mime types", () => {
    expect(() =>
      service.validateUpload(pngBuffer, "image/svg+xml"),
    ).toThrow(BadRequestException);
  });

  it("rejects files above the size limit", () => {
    const oversized = Buffer.alloc(10 * 1024 * 1024 + 1);
    expect(() => service.validateUpload(oversized, "image/png")).toThrow(
      BadRequestException,
    );
  });

  it("uploads and persists a company-scoped asset", async () => {
    mediaAssetCreate.mockResolvedValue({
      id: "media_1",
      ownerCompanyId: "co_1",
      type: MediaAssetType.image,
      fileUrl: "pending",
      thumbnailUrl: null,
      title: "photo.png",
      width: 1,
      height: 1,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
    });
    mediaAssetUpdate.mockResolvedValue({
      id: "media_1",
      ownerCompanyId: "co_1",
      type: MediaAssetType.image,
      fileUrl: "https://cdn.example.com/companies/co_1/media_1.png",
      thumbnailUrl: null,
      title: "photo.png",
      width: 1,
      height: 1,
      createdAt: new Date("2026-07-18T10:00:00.000Z"),
    });
    uploadObject.mockResolvedValue(undefined);

    const result = await service.uploadImage({
      buffer: pngBuffer,
      mimeType: "image/png",
      originalFilename: "photo.png",
      uploadedByUserId: "user_1",
      scope: { kind: "company", companyId: "co_1" },
    });

    expect(uploadObject).toHaveBeenCalledWith(
      "companies/co_1/media_1.png",
      pngBuffer,
      "image/png",
    );
    expect(result.fileUrl).toBe(
      "https://cdn.example.com/companies/co_1/media_1.png",
    );
  });

  it("lists only company-owned media for portal scope", async () => {
    mediaAssetCount.mockResolvedValue(1);
    mediaAssetFindMany.mockResolvedValue([
      {
        id: "media_1",
        fileUrl: "https://cdn.example.com/companies/co_1/media_1.png",
        thumbnailUrl: null,
        title: "photo.png",
        width: 1,
        height: 1,
        createdAt: new Date("2026-07-18T10:00:00.000Z"),
      },
    ]);

    const result = await service.listCompanyMedia("co_1", 1, 24);

    expect(mediaAssetCount).toHaveBeenCalledWith({
      where: { ownerCompanyId: "co_1" },
    });
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });
});
