import { describe, expect, it } from 'vitest';

import { decodeRouteParam, encodePathSegment } from './decode-route-param';

describe('decodeRouteParam', () => {
  it('leaves a decoded unicode slug unchanged', () => {
    expect(decodeRouteParam('տեստ')).toBe('տեստ');
  });

  it('decodes a percent-encoded unicode slug', () => {
    expect(decodeRouteParam(encodeURIComponent('տեստ'))).toBe('տեստ');
  });

  it('decodes a double-encoded slug and spaces', () => {
    expect(decodeRouteParam(encodeURIComponent(encodeURIComponent('տեստ')))).toBe('տեստ');
    expect(decodeRouteParam('Davinchi%20_Clubhouse_view')).toBe('Davinchi _Clubhouse_view');
    expect(decodeRouteParam('Davinchi%2520_Clubhouse_view')).toBe('Davinchi _Clubhouse_view');
  });
});

describe('encodePathSegment', () => {
  it('encodes a path segment once even if it is already encoded', () => {
    expect(encodePathSegment('տեստ')).toBe(encodeURIComponent('տեստ'));
    expect(encodePathSegment(encodeURIComponent('տեստ'))).toBe(encodeURIComponent('տեստ'));
    expect(encodePathSegment('Davinchi _Clubhouse_view')).toBe('Davinchi%20_Clubhouse_view');
  });
});
