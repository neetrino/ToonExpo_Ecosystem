import { describe, expect, it } from 'vitest';

import {
  buildInviteIdentifier,
  generateInviteToken,
  hashInviteToken,
  INVITE_IDENTIFIER_PREFIX,
  inviteExpiresAt,
  parseInviteUserId,
} from './invite-token';

describe('invite-token', () => {
  it('generates a 64-char hex token (32 bytes)', () => {
    const token = generateInviteToken();
    expect(token).toMatch(/^[0-9a-f]{64}$/);
  });

  it('generates unique tokens per call', () => {
    expect(generateInviteToken()).not.toBe(generateInviteToken());
  });

  it('hashes deterministically with SHA-256 (64 hex chars)', () => {
    const hash = hashInviteToken('raw-token');
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    expect(hash).toBe(hashInviteToken('raw-token'));
  });

  it('produces different hashes for different raw tokens', () => {
    expect(hashInviteToken('a')).not.toBe(hashInviteToken('b'));
  });

  it('namespaces the identifier by userId', () => {
    expect(buildInviteIdentifier('user-1')).toBe(`${INVITE_IDENTIFIER_PREFIX}user-1`);
  });

  it('parses the userId back out of a well-formed identifier', () => {
    expect(parseInviteUserId(buildInviteIdentifier('user-1'))).toBe('user-1');
  });

  it('returns null for a malformed identifier', () => {
    expect(parseInviteUserId('not-an-invite:user-1')).toBeNull();
  });

  it('expires 48 hours after the given time', () => {
    const from = new Date('2026-01-01T00:00:00.000Z');
    expect(inviteExpiresAt(from).toISOString()).toBe('2026-01-03T00:00:00.000Z');
  });
});
