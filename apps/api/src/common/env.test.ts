import { describe, expect, it } from 'vitest';

import { apiEnvSchema } from './env';

describe('apiEnvSchema', () => {
  it('accepts required development values', () => {
    const parsed = apiEnvSchema.parse({
      NODE_ENV: 'development',
      API_URL: 'http://localhost:4000',
      APP_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://user:pass@localhost:5432/toonexpo',
      AUTH_SECRET: 'x'.repeat(32),
    });

    expect(parsed.DATABASE_URL).toContain('postgresql://');
  });
});
