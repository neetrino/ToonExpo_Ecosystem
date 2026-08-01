import { describe, expect, it } from 'vitest';

import {
  buildFootprintMaskSignature,
  buildScenegraphLayerSignature,
  buildViewportSignature,
  quantizeDecimal,
  quantizeModelFadeOpacity,
} from '@/features/geo-map/utils/geo-map-update-signatures';

describe('quantizeDecimal', () => {
  it('rounds to the requested decimals', () => {
    expect(quantizeDecimal(12.3456, 2)).toBe(12.35);
    expect(quantizeDecimal(12.344, 2)).toBe(12.34);
  });
});

describe('quantizeModelFadeOpacity', () => {
  it('keeps 0 and 1 as endpoints', () => {
    expect(quantizeModelFadeOpacity(0)).toBe(0);
    expect(quantizeModelFadeOpacity(1)).toBe(1);
  });

  it('snaps mid values to discrete steps', () => {
    expect(quantizeModelFadeOpacity(0.45, 5)).toBe(0.4);
    expect(quantizeModelFadeOpacity(0.5, 5)).toBe(0.6);
    expect(quantizeModelFadeOpacity(0.92, 5)).toBe(1);
  });
});

describe('buildViewportSignature', () => {
  it('ignores sub-quantum zoom and bounds noise', () => {
    const a = buildViewportSignature({
      zoom: 14.001,
      bounds: { west: 44.51, south: 40.18, east: 44.52, north: 40.19 },
    });
    const b = buildViewportSignature({
      zoom: 14.004,
      bounds: { west: 44.51001, south: 40.18001, east: 44.52001, north: 40.19001 },
    });
    expect(a).toBe(b);
  });

  it('changes when zoom crosses a quantum', () => {
    const a = buildViewportSignature({ zoom: 14.0, bounds: null });
    const b = buildViewportSignature({ zoom: 14.02, bounds: null });
    expect(a).not.toBe(b);
  });
});

describe('buildFootprintMaskSignature', () => {
  it('is stable for the same id set and positions', () => {
    const models = [
      { id: 'b', longitude: 44.51, latitude: 40.18, sourceOsmId: '1' },
      { id: 'a', longitude: 44.52, latitude: 40.19, sourceOsmId: null },
    ];
    expect(buildFootprintMaskSignature(models)).toBe(
      buildFootprintMaskSignature([...models].reverse()),
    );
  });

  it('changes when a model id is added', () => {
    const base = [{ id: 'a', longitude: 44.51, latitude: 40.18 }];
    const next = [...base, { id: 'b', longitude: 44.52, latitude: 40.19 }];
    expect(buildFootprintMaskSignature(base)).not.toBe(buildFootprintMaskSignature(next));
  });
});

describe('buildScenegraphLayerSignature', () => {
  const model = {
    id: 'm1',
    modelUrl: 'https://cdn.example/a.glb',
    longitude: 44.51,
    latitude: 40.18,
    altitudeM: 0,
    headingDeg: 0,
    pitchDeg: 0,
    rollDeg: 0,
    scale: 1,
    minZoom: 14,
  };

  it('ignores opacity micro-noise already quantized by the caller', () => {
    expect(buildScenegraphLayerSignature([model], 0.6, null)).toBe(
      buildScenegraphLayerSignature([model], 0.6, null),
    );
  });

  it('changes when highlight or opacity step changes', () => {
    expect(buildScenegraphLayerSignature([model], 0.6, null)).not.toBe(
      buildScenegraphLayerSignature([model], 0.8, null),
    );
    expect(buildScenegraphLayerSignature([model], 0.6, null)).not.toBe(
      buildScenegraphLayerSignature([model], 0.6, 'm1'),
    );
  });
});
