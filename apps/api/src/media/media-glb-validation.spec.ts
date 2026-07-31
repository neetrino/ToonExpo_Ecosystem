import { BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppEnv } from '../config/env.validation.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import { MediaUploadService } from './media-upload.service.js';
import type { R2StorageClient } from './media.types.js';

describe('MediaUploadService GLB validation', () => {
  let service: MediaUploadService;

  beforeEach(() => {
    const prisma = { db: { mediaAsset: {} } } as unknown as PrismaService;
    const config = {
      get: vi.fn(),
    } as unknown as ConfigService<AppEnv, true>;
    service = new MediaUploadService(prisma, config, null as unknown as R2StorageClient);
  });

  it('accepts .glb with model/gltf-binary', () => {
    expect(service.validateGlbUpload(Buffer.alloc(100), 'model/gltf-binary', 'tower.glb')).toBe(
      'model/gltf-binary',
    );
  });

  it('rejects non-glb extension', () => {
    expect(() =>
      service.validateGlbUpload(Buffer.alloc(100), 'model/gltf-binary', 'tower.gltf'),
    ).toThrow(BadRequestException);
  });

  it('rejects unsupported mime', () => {
    expect(() => service.validateGlbUpload(Buffer.alloc(100), 'image/png', 'tower.glb')).toThrow(
      BadRequestException,
    );
  });

  it('rejects oversized buffer', () => {
    const huge = Buffer.alloc(26 * 1024 * 1024);
    expect(() => service.validateGlbUpload(huge, 'application/octet-stream', 'tower.glb')).toThrow(
      BadRequestException,
    );
  });
});
