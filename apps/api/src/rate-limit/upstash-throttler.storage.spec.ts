import { describe, expect, it, vi } from "vitest";

import { RATE_LIMIT_INCREMENT_LUA } from "./rate-limit.constants.js";
import {
  UpstashThrottlerStorage,
  type RedisEvalClient,
} from "./upstash-throttler.storage.js";

const REST_URL = "https://example.upstash.io";
const REST_TOKEN = "test-token";
const THROTTLER_NAME = "default";
const TRACKER_KEY = "tracker-key";

const createStorage = (
  evalImpl: RedisEvalClient["eval"],
): { storage: UpstashThrottlerStorage; evalMock: RedisEvalClient["eval"] } => {
  const evalMock = vi.fn(evalImpl);
  const redis: RedisEvalClient = { eval: evalMock };
  const logger = { error: vi.fn() };
  const storage = new UpstashThrottlerStorage(
    REST_URL,
    REST_TOKEN,
    logger as never,
    redis,
  );

  return { storage, evalMock };
};

describe("UpstashThrottlerStorage", () => {
  it("increments hit count across calls via atomic Lua eval", async () => {
    let hits = 0;
    const { storage, evalMock } = createStorage(async () => {
      hits += 1;
      return [hits, 60, 0, 0] as const;
    });

    const first = await storage.increment(
      TRACKER_KEY,
      60_000,
      10,
      60_000,
      THROTTLER_NAME,
    );
    const second = await storage.increment(
      TRACKER_KEY,
      60_000,
      10,
      60_000,
      THROTTLER_NAME,
    );

    expect(first.totalHits).toBe(1);
    expect(second.totalHits).toBe(2);
    expect(first.isBlocked).toBe(false);
    expect(evalMock).toHaveBeenCalledTimes(2);
    expect(evalMock.mock.calls[0]?.[0]).toBe(RATE_LIMIT_INCREMENT_LUA);
    expect(evalMock.mock.calls[0]?.[1]).toEqual([
      `rl:${THROTTLER_NAME}:${TRACKER_KEY}`,
      `rl:${THROTTLER_NAME}:${TRACKER_KEY}:block`,
    ]);
  });

  it("returns blocked state when Lua reports limit exceeded", async () => {
    const { storage } = createStorage(async () => [11, 45, 1, 60] as const);

    const result = await storage.increment(
      TRACKER_KEY,
      60_000,
      10,
      60_000,
      THROTTLER_NAME,
    );

    expect(result.totalHits).toBe(11);
    expect(result.isBlocked).toBe(true);
    expect(result.timeToBlockExpire).toBe(60);
    expect(result.timeToExpire).toBe(45);
  });

  it("fail-open allows requests when Redis throws", async () => {
    const logger = { error: vi.fn() };
    const redis: RedisEvalClient = {
      eval: vi.fn(async () => {
        throw new Error("Upstash unavailable");
      }),
    };
    const failOpenStorage = new UpstashThrottlerStorage(
      REST_URL,
      REST_TOKEN,
      logger as never,
      redis,
    );

    const result = await failOpenStorage.increment(
      TRACKER_KEY,
      60_000,
      10,
      60_000,
      THROTTLER_NAME,
    );

    expect(result.isBlocked).toBe(false);
    expect(result.totalHits).toBe(0);
    expect(result.timeToExpire).toBe(60);
    expect(logger.error).toHaveBeenCalled();
  });
});
