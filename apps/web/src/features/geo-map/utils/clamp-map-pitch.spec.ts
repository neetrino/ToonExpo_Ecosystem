import { describe, expect, it } from 'vitest';

import { MAX_MAP_PITCH_DEG } from '@/features/geo-map/constants';
import { clampMapPitch } from '@/features/geo-map/utils/clamp-map-pitch';

describe('clampMapPitch', () => {
  it('leaves in-range pitches unchanged', () => {
    expect(clampMapPitch(0)).toBe(0);
    expect(clampMapPitch(55)).toBe(55);
    expect(clampMapPitch(MAX_MAP_PITCH_DEG)).toBe(MAX_MAP_PITCH_DEG);
  });

  it('clamps below zero and above maxPitch', () => {
    expect(clampMapPitch(-10)).toBe(0);
    expect(clampMapPitch(MAX_MAP_PITCH_DEG + 20)).toBe(MAX_MAP_PITCH_DEG);
  });
});
