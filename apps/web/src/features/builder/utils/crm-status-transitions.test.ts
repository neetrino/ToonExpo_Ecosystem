import { describe, expect, it } from 'vitest';

import {
  crmStatusRequiresApartment,
  getCrmStatusSelectOptions,
  isCrmStatusTransitionAllowed,
} from './crm-status-transitions';

describe('isCrmStatusTransitionAllowed', () => {
  it('allows staying on the same status', () => {
    expect(isCrmStatusTransitionAllowed('new_request', 'new_request')).toBe(true);
  });

  it('allows documented forward transitions', () => {
    expect(isCrmStatusTransitionAllowed('new_request', 'assigned')).toBe(true);
    expect(isCrmStatusTransitionAllowed('contacted', 'apartment_selected')).toBe(true);
    expect(isCrmStatusTransitionAllowed('reserved', 'converted')).toBe(true);
  });

  it('rejects illegal jumps', () => {
    expect(isCrmStatusTransitionAllowed('new_request', 'reserved')).toBe(false);
    expect(isCrmStatusTransitionAllowed('converted', 'lost')).toBe(false);
    expect(isCrmStatusTransitionAllowed('lost', 'contacted')).toBe(false);
  });

  it('always allows reset to new_request', () => {
    expect(isCrmStatusTransitionAllowed('assigned', 'new_request')).toBe(true);
    expect(isCrmStatusTransitionAllowed('contacted', 'new_request')).toBe(true);
    expect(isCrmStatusTransitionAllowed('converted', 'new_request')).toBe(true);
    expect(isCrmStatusTransitionAllowed('lost', 'new_request')).toBe(true);
  });
});

describe('getCrmStatusSelectOptions', () => {
  it('includes current status first', () => {
    const options = getCrmStatusSelectOptions('assigned');
    expect(options[0]).toBe('assigned');
    expect(options).toContain('contacted');
    expect(options).toContain('lost');
    expect(options).toContain('new_request');
  });

  it('allows reset to new from terminal statuses', () => {
    expect(getCrmStatusSelectOptions('converted')).toEqual(['converted', 'new_request']);
    expect(getCrmStatusSelectOptions('closed')).toContain('new_request');
    expect(getCrmStatusSelectOptions('lost')).toContain('new_request');
  });
});

describe('crmStatusRequiresApartment', () => {
  it('flags apartment-gated pipeline stages', () => {
    expect(crmStatusRequiresApartment('apartment_selected')).toBe(true);
    expect(crmStatusRequiresApartment('reserved')).toBe(true);
    expect(crmStatusRequiresApartment('converted')).toBe(true);
    expect(crmStatusRequiresApartment('contacted')).toBe(false);
  });
});
