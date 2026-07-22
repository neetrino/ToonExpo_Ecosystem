import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  clearClientSessionHint,
  CLIENT_SESSION_HINT_STORAGE_KEY,
  hasClientSessionHint,
  markClientSessionHint,
} from './session-hint';

const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear: () => {
      store.clear();
    },
    getItem: (key: string) => store.get(key) ?? null,
    key: (index: number) => [...store.keys()][index] ?? null,
    removeItem: (key: string) => {
      store.delete(key);
    },
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
};

describe('session-hint', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false without cookie or storage hint', () => {
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('window', {
      sessionStorage: createMemoryStorage(),
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    expect(hasClientSessionHint()).toBe(false);
  });

  it('is true when the CSRF cookie is present', () => {
    vi.stubGlobal('document', { cookie: 'toonexpo_csrf=token-value' });
    vi.stubGlobal('window', {
      sessionStorage: createMemoryStorage(),
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    expect(hasClientSessionHint()).toBe(true);
  });

  it('is true after markClientSessionHint even without cookie', () => {
    const sessionStorage = createMemoryStorage();
    vi.stubGlobal('document', { cookie: '' });
    vi.stubGlobal('window', {
      sessionStorage,
      dispatchEvent: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    });
    vi.stubGlobal('sessionStorage', sessionStorage);

    markClientSessionHint();
    expect(sessionStorage.getItem(CLIENT_SESSION_HINT_STORAGE_KEY)).toBe('1');
    expect(hasClientSessionHint()).toBe(true);

    clearClientSessionHint();
    expect(hasClientSessionHint()).toBe(false);
  });
});
