import { describe, expect, it, vi } from 'vitest';

import {
  DEFAULT_ANALYTICS_SAMPLE_RATE,
  isBotUserAgent,
  parseAnalyticsSampleRate,
  shouldSampleAnalyticsEvent,
} from './sampling';

describe('parseAnalyticsSampleRate', () => {
  it('defaults to keep-all for empty or invalid values', () => {
    expect(parseAnalyticsSampleRate(undefined)).toBe(DEFAULT_ANALYTICS_SAMPLE_RATE);
    expect(parseAnalyticsSampleRate('')).toBe(DEFAULT_ANALYTICS_SAMPLE_RATE);
    expect(parseAnalyticsSampleRate('nope')).toBe(DEFAULT_ANALYTICS_SAMPLE_RATE);
    expect(parseAnalyticsSampleRate('1.5')).toBe(DEFAULT_ANALYTICS_SAMPLE_RATE);
    expect(parseAnalyticsSampleRate('-0.1')).toBe(DEFAULT_ANALYTICS_SAMPLE_RATE);
  });

  it('accepts rates in 0–1', () => {
    expect(parseAnalyticsSampleRate('0')).toBe(0);
    expect(parseAnalyticsSampleRate('0.25')).toBe(0.25);
    expect(parseAnalyticsSampleRate('1')).toBe(1);
  });
});

describe('shouldSampleAnalyticsEvent', () => {
  it('always records non-view events', () => {
    expect(shouldSampleAnalyticsEvent('FAVORITE_ADDED', 0)).toBe(true);
  });

  it('keeps all views at rate 1 and drops all at rate 0', () => {
    expect(shouldSampleAnalyticsEvent('PROJECT_VIEW', 1)).toBe(true);
    expect(shouldSampleAnalyticsEvent('APARTMENT_VIEW', 0)).toBe(false);
  });

  it('samples views using Math.random when rate is between 0 and 1', () => {
    const spy = vi.spyOn(Math, 'random').mockReturnValue(0.2);
    expect(shouldSampleAnalyticsEvent('PROJECT_VIEW', 0.5)).toBe(true);
    spy.mockReturnValue(0.8);
    expect(shouldSampleAnalyticsEvent('PROJECT_VIEW', 0.5)).toBe(false);
    spy.mockRestore();
  });
});

describe('isBotUserAgent', () => {
  it('skips filter when user-agent is missing', () => {
    expect(isBotUserAgent(undefined)).toBe(false);
    expect(isBotUserAgent(null)).toBe(false);
    expect(isBotUserAgent('')).toBe(false);
  });

  it('detects common bots and prerender agents', () => {
    expect(isBotUserAgent('Mozilla/5.0 (compatible; Googlebot/2.1)')).toBe(true);
    expect(isBotUserAgent('facebookexternalhit/1.1')).toBe(true);
    expect(isBotUserAgent('Prerender (+https://github.com/prerender/prerender)')).toBe(true);
    expect(
      isBotUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0',
      ),
    ).toBe(false);
  });
});
