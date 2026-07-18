/** Redis key prefix for distributed rate-limit counters (`rl:{throttlerName}:{key}`). */
export const RATE_LIMIT_KEY_PREFIX = "rl:";

/** Suffix for block keys (`rl:{throttlerName}:{key}:block`). */
export const RATE_LIMIT_BLOCK_KEY_SUFFIX = ":block";

/** Upstash REST eval timeout; fail-open after this duration. */
export const UPSTASH_REDIS_REQUEST_TIMEOUT_MS = 2_000;

/**
 * Atomic Lua script: INCR counter, PEXPIRE window, set/read block key.
 * Returns { totalHits, timeToExpireSec, isBlocked (0|1), timeToBlockExpireSec }.
 */
export const RATE_LIMIT_INCREMENT_LUA = `
local counter_key = KEYS[1]
local block_key = KEYS[2]
local ttl_ms = tonumber(ARGV[1])
local limit = tonumber(ARGV[2])
local block_duration_ms = tonumber(ARGV[3])

local block_pttl = redis.call('PTTL', block_key)
if block_pttl > 0 then
  local total_hits = tonumber(redis.call('GET', counter_key) or '0')
  local counter_pttl = redis.call('PTTL', counter_key)
  local time_to_expire = 0
  if counter_pttl > 0 then
    time_to_expire = math.ceil(counter_pttl / 1000)
  end
  return {total_hits, time_to_expire, 1, math.ceil(block_pttl / 1000)}
end

if block_pttl == 0 or block_pttl == -1 then
  redis.call('DEL', block_key)
end

local current = redis.call('INCR', counter_key)
if current == 1 then
  redis.call('PEXPIRE', counter_key, ttl_ms)
end

local counter_pttl = redis.call('PTTL', counter_key)
local time_to_expire = math.ceil(counter_pttl / 1000)

if current > limit then
  redis.call('SET', block_key, '1', 'PX', block_duration_ms)
  return {current, time_to_expire, 1, math.ceil(block_duration_ms / 1000)}
end

return {current, time_to_expire, 0, 0}
`;
