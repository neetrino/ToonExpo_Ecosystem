import { describe, expect, it, vi } from 'vitest';

import {
  createTransparentStyleImage,
  registerMissingStyleImageResolver,
} from '@/features/geo-map/utils/register-missing-style-image-resolver';

describe('createTransparentStyleImage', () => {
  it('returns a 1×1 fully transparent RGBA buffer', () => {
    const image = createTransparentStyleImage();

    expect(image.width).toBe(1);
    expect(image.height).toBe(1);
    expect(image.data).toHaveLength(4);
    expect([...image.data]).toEqual([0, 0, 0, 0]);
  });
});

describe('registerMissingStyleImageResolver', () => {
  it('registers a transparent image for each missing id once', () => {
    const images = new Set<string>();
    let resolver: ((id: string) => void) | null = null;

    const map = {
      setMissingStyleImageResolver: vi.fn((callback: (id: string) => void) => {
        resolver = callback;
        return map;
      }),
      hasImage: (id: string) => images.has(id),
      addImage: vi.fn((id: string) => {
        images.add(id);
        return map;
      }),
    };

    registerMissingStyleImageResolver(map as never);

    expect(map.setMissingStyleImageResolver).toHaveBeenCalledTimes(1);
    expect(resolver).not.toBeNull();

    resolver!('office');
    resolver!('office');
    resolver!('atm');

    expect(map.addImage).toHaveBeenCalledTimes(2);
    expect(map.addImage).toHaveBeenNthCalledWith(1, 'office', createTransparentStyleImage());
    expect(map.addImage).toHaveBeenNthCalledWith(2, 'atm', createTransparentStyleImage());
  });
});
