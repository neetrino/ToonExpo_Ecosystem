import { describe, expect, it } from 'vitest';

import {
  BACK_LINK_BASE_CLASS,
  BACK_LINK_ICON_SIZE,
  BACK_LINK_TONE_CLASS,
  BACK_LINK_VARIANT_CLASS,
} from '@/shared/ui/back-link.constants';

describe('back-link.constants', () => {
  it('defines all variants and tones', () => {
    expect(BACK_LINK_VARIANT_CLASS.standard).toContain('h-9');
    expect(BACK_LINK_VARIANT_CLASS.compact).toContain('h-8');
    expect(BACK_LINK_VARIANT_CLASS.icon).toContain('size-10');
    expect(BACK_LINK_TONE_CLASS.default).toContain('bg-surface-elevated');
    expect(BACK_LINK_TONE_CLASS.onDark).toContain('text-on-dark');
    expect(BACK_LINK_TONE_CLASS.subtle).toContain('bg-transparent');
    expect(BACK_LINK_ICON_SIZE.icon).toBe('size-5');
    expect(BACK_LINK_BASE_CLASS).toContain('motion-reduce:transition-none');
  });
});
