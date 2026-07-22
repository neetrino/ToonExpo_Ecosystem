import { describe, expect, it } from 'vitest';

import { convertAmdToDisplayAmount, displayCurrencyForLocale } from './display-currency';
import {
  formatCatalogPrice,
  formatCompactPrice,
  formatPriceRange,
  isPriceHidden,
  resolveHiddenPriceLabel,
} from './format-price';

describe('isPriceHidden', () => {
  it('hides null and empty amounts', () => {
    expect(isPriceHidden('public', null)).toBe(true);
    expect(isPriceHidden('public', '')).toBe(true);
  });

  it('shows amounts the API already revealed (any visibility)', () => {
    expect(isPriceHidden('by_request', '100')).toBe(false);
    expect(isPriceHidden('visible_after_login', '100')).toBe(false);
    expect(isPriceHidden('public', '100')).toBe(false);
  });
});

describe('resolveHiddenPriceLabel', () => {
  it('uses sign-in label for visible_after_login', () => {
    expect(
      resolveHiddenPriceLabel({
        priceVisibility: 'visible_after_login',
        onRequestLabel: 'Price on request',
        signInLabel: 'Sign in to see price',
      }),
    ).toBe('Sign in to see price');
  });

  it('uses on-request for by_request', () => {
    expect(
      resolveHiddenPriceLabel({
        priceVisibility: 'by_request',
        onRequestLabel: 'Price on request',
        signInLabel: 'Sign in to see price',
      }),
    ).toBe('Price on request');
  });
});

describe('displayCurrencyForLocale', () => {
  it('maps locales to display currencies', () => {
    expect(displayCurrencyForLocale('hy')).toBe('AMD');
    expect(displayCurrencyForLocale('en')).toBe('USD');
    expect(displayCurrencyForLocale('ru')).toBe('RUB');
  });
});

describe('convertAmdToDisplayAmount', () => {
  it('converts with default FX rates', () => {
    expect(convertAmdToDisplayAmount(39_000_000, 'USD')).toBe(100_000);
    expect(convertAmdToDisplayAmount(40_000_000, 'RUB')).toBe(10_000_000);
    expect(convertAmdToDisplayAmount(61_500_000, 'AMD')).toBe(61_500_000);
  });
});

describe('formatCatalogPrice', () => {
  it('returns sign-in label when visible_after_login and amount missing', () => {
    expect(
      formatCatalogPrice({
        amount: null,
        currency: 'AMD',
        locale: 'en',
        priceVisibility: 'visible_after_login',
        onRequestLabel: 'Price on request',
        signInLabel: 'Sign in to see price',
      }),
    ).toBe('Sign in to see price');
  });

  it('returns on-request label when by_request', () => {
    expect(
      formatCatalogPrice({
        amount: null,
        currency: 'AMD',
        locale: 'en',
        priceVisibility: 'by_request',
        onRequestLabel: 'Price on request',
        signInLabel: 'Sign in to see price',
      }),
    ).toBe('Price on request');
  });

  it('formats public AMD amounts in dram for hy', () => {
    const formatted = formatCatalogPrice({
      amount: '61500000',
      currency: 'AMD',
      locale: 'hy',
      priceVisibility: 'public',
      onRequestLabel: 'Price on request',
    });
    expect(formatted).toContain('֏');
    expect(formatted).toContain('61');
  });
});

describe('formatCompactPrice', () => {
  it('keeps AMD dram for Armenian', () => {
    expect(
      formatCompactPrice({
        amount: '39000000',
        currency: 'AMD',
        locale: 'hy',
        fromLabel: 'սկսած',
        onRequestLabel: 'Price on request',
      }),
    ).toBe(`սկսած 39${'\u00a0'}000${'\u00a0'}000 ֏`);
  });

  it('converts to USD for English', () => {
    expect(
      formatCompactPrice({
        amount: '39000000',
        currency: 'AMD',
        locale: 'en',
        fromLabel: 'from',
        onRequestLabel: 'Price on request',
      }),
    ).toBe('from $100,000');
  });

  it('converts to RUB for Russian', () => {
    expect(
      formatCompactPrice({
        amount: '40000000',
        currency: 'AMD',
        locale: 'ru',
        fromLabel: 'от',
        onRequestLabel: 'Price on request',
      }),
    ).toBe(`от 10${'\u00a0'}000${'\u00a0'}000 ₽`);
  });

  it('returns on-request when amount missing', () => {
    expect(
      formatCompactPrice({
        amount: null,
        currency: 'AMD',
        locale: 'en',
        fromLabel: 'from',
        onRequestLabel: 'Price on request',
      }),
    ).toBe('Price on request');
  });
});

describe('formatPriceRange', () => {
  it('joins min and max when different', () => {
    const range = formatPriceRange({
      minPrice: '1000',
      maxPrice: '2000',
      currency: 'USD',
      locale: 'en',
      onRequestLabel: 'Price on request',
    });
    expect(range).toContain('–');
  });

  it('returns on-request when both missing', () => {
    expect(
      formatPriceRange({
        minPrice: null,
        maxPrice: null,
        currency: null,
        locale: 'en',
        onRequestLabel: 'Price on request',
      }),
    ).toBe('Price on request');
  });
});
