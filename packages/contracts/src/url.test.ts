import { describe, expect, it } from 'vitest';

import { httpUrlSchema, isHttpUrl, optionalHttpUrlSchema } from './url';

describe('isHttpUrl', () => {
  it('accepts http and https URLs', () => {
    expect(isHttpUrl('https://example.com/logo.png')).toBe(true);
    expect(isHttpUrl('http://example.com')).toBe(true);
  });

  it('rejects javascript and data schemes', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isHttpUrl('not-a-url')).toBe(false);
  });
});

describe('httpUrlSchema', () => {
  it('rejects non-http(s) schemes', () => {
    expect(httpUrlSchema.safeParse('javascript:alert(1)').success).toBe(false);
    expect(httpUrlSchema.safeParse('data:image/png;base64,abc').success).toBe(false);
  });

  it('accepts https URLs', () => {
    expect(httpUrlSchema.safeParse('https://picsum.photos/seed/logo/200/200').success).toBe(true);
  });
});

describe('optionalHttpUrlSchema', () => {
  const schema = optionalHttpUrlSchema(2048);

  it('treats blank strings as undefined', () => {
    const result = schema.safeParse('');
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBeUndefined();
    }
  });

  it('rejects dangerous schemes when present', () => {
    expect(schema.safeParse('javascript:void(0)').success).toBe(false);
  });
});
