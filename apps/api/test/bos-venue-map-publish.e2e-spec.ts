import { ValidationPipe } from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test, type TestingModule } from '@nestjs/testing';
import { API_V1_PREFIX } from '@toonexpo/contracts';
import { MediaAssetType } from '@toonexpo/db';
import request from 'supertest';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppModule } from '../src/app.module.js';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter.js';
import { BOS_API_KEY_HEADER } from '../src/common/constants/app.constants.js';
import { BosVenueMapBackgroundService } from '../src/integrations/bos/bos-venue-map-background.service.js';
import { PrismaService } from '../src/prisma/prisma.service.js';
import { loadRootEnv } from './load-root-env.js';

const GLOBAL_PREFIX = API_V1_PREFIX.replace(/^\//, '');
const CHECKSUM = 'c'.repeat(64);

const validBody = (overrides: Record<string, unknown> = {}) => ({
  request_id: `map-req-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  schema_version: 'venue-map.v1',
  bos_venue_plan_id: `plan-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  bos_event_cycle_id: 'cycle-e2e',
  bos_event_cycle_code: '2026',
  snapshot_version: 1,
  checksum: CHECKSUM,
  published_at: '2026-08-12T08:00:00.000Z',
  content: {
    title: 'E2E Hall',
    background: {
      url: 'https://cdn.example.com/map.png',
      width: 1200,
      height: 800,
      pixels_per_meter: 16,
      grid_origin_x: 0,
      grid_origin_y: 0,
    },
    areas: [
      {
        code: 'A1',
        square_meters: 18,
        cells: [{ x: 1, y: 2 }],
        public_display_mode: 'organization',
        occupant: { organization_name: 'E2E Builder' },
      },
    ],
  },
  ...overrides,
});

describe('BOS venue-map publish (e2e)', () => {
  let app: NestExpressApplication;
  let prisma: PrismaService;
  let bosApiKey = '';
  const createdRequestIds: string[] = [];
  const createdPlanIds: string[] = [];
  const createdMediaIds: string[] = [];

  const background = {
    ingest: vi.fn(),
  };

  beforeAll(async () => {
    process.env['NODE_ENV'] = process.env['NODE_ENV'] ?? 'test';
    loadRootEnv();
    bosApiKey = process.env['BOS_API_KEY'] ?? 'local-bos-test-key-123456789012345678901234567890';
    process.env['BOS_API_KEY'] = bosApiKey;

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BosVenueMapBackgroundService)
      .useValue(background)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix(GLOBAL_PREFIX);
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    app.useGlobalFilters(app.get(AllExceptionsFilter));
    await app.init();

    prisma = app.get(PrismaService);
    background.ingest.mockImplementation(async () => {
      const asset = await prisma.db.mediaAsset.create({
        data: {
          type: MediaAssetType.image,
          fileUrl: 'https://cdn.example.com/bos-e2e-map.png',
        },
      });
      createdMediaIds.push(asset.id);
      return { mediaAssetId: asset.id };
    });
  });

  beforeEach(() => {
    background.ingest.mockClear();
  });

  afterAll(async () => {
    if (createdRequestIds.length > 0) {
      await prisma.db.mapPublicationReceipt.deleteMany({
        where: { requestId: { in: createdRequestIds } },
      });
    }
    if (createdPlanIds.length > 0) {
      await prisma.db.publicVenueMapSnapshot.deleteMany({
        where: { bosVenuePlanId: { in: createdPlanIds } },
      });
    }
    if (createdMediaIds.length > 0) {
      await prisma.db.mediaAsset.deleteMany({
        where: { id: { in: createdMediaIds } },
      });
    }
    await app.close();
  });

  const postPublish = (body: Record<string, unknown>, apiKey?: string) =>
    request(app.getHttpServer())
      .post(`${API_V1_PREFIX}/integrations/bos/venue-map/publish`)
      .set(BOS_API_KEY_HEADER, apiKey ?? bosApiKey)
      .send(body);

  it('returns 401 for a wrong API key', async () => {
    await postPublish(validBody(), 'wrong-key-value').expect(401);
  });

  it('returns 400 for an invalid schema_version', async () => {
    await postPublish(validBody({ schema_version: 'venue-map.v0' })).expect(400);
  });

  it('returns rejected when a hidden area includes occupant identity', async () => {
    const body = validBody({
      content: {
        title: 'E2E Hall',
        background: {
          url: 'https://cdn.example.com/map.png',
          width: 1200,
          height: 800,
          pixels_per_meter: 16,
          grid_origin_x: 0,
          grid_origin_y: 0,
        },
        areas: [
          {
            code: 'H1',
            square_meters: 10,
            cells: [{ x: 0, y: 0 }],
            public_display_mode: 'hidden',
            occupant: { organization_name: 'Secret' },
          },
        ],
      },
    });
    createdRequestIds.push(body.request_id as string);

    const response = await postPublish(body).expect(200);
    expect(response.body.status).toBe('rejected');
    expect(background.ingest).not.toHaveBeenCalled();
  });

  it('publishes a snapshot and replays the same request_id', async () => {
    const body = validBody();
    createdRequestIds.push(body.request_id as string);
    createdPlanIds.push(body.bos_venue_plan_id as string);

    const first = await postPublish(body).expect(200);
    expect(first.body.status).toBe('published');
    expect(first.body.toonexpo_snapshot_id).toEqual(expect.any(String));

    const second = await postPublish(body).expect(200);
    expect(second.body.status).toBe('published');
    expect(second.body.toonexpo_snapshot_id).toBe(first.body.toonexpo_snapshot_id);
    expect(background.ingest).toHaveBeenCalledOnce();
  });
});
