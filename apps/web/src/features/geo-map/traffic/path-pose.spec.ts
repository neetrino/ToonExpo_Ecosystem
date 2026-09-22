import { describe, expect, it } from 'vitest';

import { pathHeadingDeg, pathLengthM, poseAlongPath } from '@/features/geo-map/traffic/path-pose';

const eastLine = [
  { longitude: 44.51, latitude: 40.18 },
  { longitude: 44.52, latitude: 40.18 },
];

describe('path-pose', () => {
  it('measures the road length', () => {
    expect(pathLengthM(eastLine)).toBeGreaterThan(700);
  });

  it('places a car at the start of the road', () => {
    const pose = poseAlongPath(eastLine, 0);
    expect(pose?.longitude).toBeCloseTo(44.51, 5);
    expect(pose?.latitude).toBeCloseTo(40.18, 5);
  });

  it('faces east on an eastbound road', () => {
    expect(pathHeadingDeg(eastLine[0]!, eastLine[1]!)).toBeCloseTo(90, 0);
  });
});
