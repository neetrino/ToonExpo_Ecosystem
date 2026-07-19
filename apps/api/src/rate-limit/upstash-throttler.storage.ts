import { Injectable } from "@nestjs/common";
import type { ThrottlerStorage } from "@nestjs/throttler";
import { Redis } from "@upstash/redis";
import type { PinoLogger } from "nestjs-pino";

import {
  RATE_LIMIT_BLOCK_KEY_SUFFIX,
  RATE_LIMIT_INCREMENT_LUA,
  RATE_LIMIT_KEY_PREFIX,
  UPSTASH_REDIS_REQUEST_TIMEOUT_MS,
} from "./rate-limit.constants.js";

type ThrottlerIncrementRecord = {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
};

/** Minimal Upstash client surface used by rate-limit storage (mocked in tests). */
export type RedisEvalClient = {
  eval: (
    script: string,
    keys: string[],
    args: string[],
  ) => Promise<unknown>;
};

type LuaEvalResult = [number, number, number, number];

const buildCounterKey = (throttlerName: string, key: string): string =>
  `${RATE_LIMIT_KEY_PREFIX}${throttlerName}:${key}`;

const buildBlockKey = (throttlerName: string, key: string): string =>
  `${buildCounterKey(throttlerName, key)}${RATE_LIMIT_BLOCK_KEY_SUFFIX}`;

const parseLuaResult = (result: unknown): ThrottlerIncrementRecord => {
  if (!Array.isArray(result) || result.length !== 4) {
    throw new Error("Unexpected rate-limit Lua script result");
  }

  const [totalHits, timeToExpire, isBlockedFlag, timeToBlockExpire] =
    result as LuaEvalResult;

  return {
    totalHits,
    timeToExpire,
    isBlocked: isBlockedFlag === 1,
    timeToBlockExpire,
  };
};

const createFailOpenRecord = (ttl: number): ThrottlerIncrementRecord => ({
  totalHits: 0,
  timeToExpire: Math.ceil(ttl / 1000),
  isBlocked: false,
  timeToBlockExpire: 0,
});

const withTimeout = <T>(
  promise: Promise<T>,
  timeoutMs: number,
): Promise<T> => {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Upstash Redis request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
};

/**
 * Distributed {@link ThrottlerStorage} backed by Upstash Redis REST API.
 * Fail-open on Redis errors so outages degrade gracefully.
 */
@Injectable()
export class UpstashThrottlerStorage implements ThrottlerStorage {
  private readonly redis: RedisEvalClient;

  constructor(
    restUrl: string,
    restToken: string,
    private readonly logger: PinoLogger,
    redisClient?: RedisEvalClient,
  ) {
    this.redis =
      redisClient ??
      new Redis({
        url: restUrl,
        token: restToken,
        retry: false,
      });
  }

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerIncrementRecord> {
    const counterKey = buildCounterKey(throttlerName, key);
    const blockKey = buildBlockKey(throttlerName, key);

    try {
      const rawResult = await withTimeout(
        this.redis.eval(RATE_LIMIT_INCREMENT_LUA, [counterKey, blockKey], [
          String(ttl),
          String(limit),
          String(blockDuration),
        ]),
        UPSTASH_REDIS_REQUEST_TIMEOUT_MS,
      );

      return parseLuaResult(rawResult);
    } catch (error: unknown) {
      this.logger.error(
        { err: error, throttlerName, key: counterKey },
        "Rate-limit Redis increment failed; allowing request (fail-open)",
      );
      return createFailOpenRecord(ttl);
    }
  }
}
