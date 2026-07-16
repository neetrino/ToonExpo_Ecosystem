import { describe, expect, it } from 'vitest';

import { shouldEnableSwagger } from './swagger-gate';

describe('shouldEnableSwagger', () => {
  it('enables docs in development', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'development' })).toBe(true);
  });

  it('disables docs in production by default', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'production' })).toBe(false);
  });

  it('enables docs in production when SWAGGER_ENABLED is true', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'production', SWAGGER_ENABLED: true })).toBe(true);
  });

  it('keeps docs disabled in production when SWAGGER_ENABLED is false', () => {
    expect(shouldEnableSwagger({ NODE_ENV: 'production', SWAGGER_ENABLED: false })).toBe(false);
  });
});
