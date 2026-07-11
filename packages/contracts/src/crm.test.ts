import { describe, expect, it } from 'vitest';

import {
  dealActivityInputSchema,
  dealStageUpdateInputSchema,
  manualDealInputSchema,
  publicRequestInputSchema,
} from './crm';

describe('publicRequestInputSchema', () => {
  it('accepts a project-page request with contact fields', () => {
    const parsed = publicRequestInputSchema.safeParse({
      projectId: 'proj_1',
      name: 'Ani Petrosyan',
      phone: '+37491112233',
      email: 'ani@example.com',
      message: 'Interested in 2-bedroom units',
    });
    expect(parsed.success).toBe(true);
  });

  it('accepts an apartment-page request', () => {
    expect(
      publicRequestInputSchema.safeParse({
        apartmentId: 'apt_1',
        name: 'Ani',
        phone: '+37491112233',
        email: 'ani@example.com',
      }).success,
    ).toBe(true);
  });

  it('rejects when neither projectId nor apartmentId is set', () => {
    expect(
      publicRequestInputSchema.safeParse({
        name: 'Ani',
        phone: '+37491112233',
        email: 'ani@example.com',
      }).success,
    ).toBe(false);
  });

  it('rejects an invalid email', () => {
    expect(
      publicRequestInputSchema.safeParse({
        projectId: 'proj_1',
        name: 'Ani',
        phone: '+37491112233',
        email: 'not-an-email',
      }).success,
    ).toBe(false);
  });
});

describe('dealStageUpdateInputSchema', () => {
  it('accepts a valid stage change', () => {
    expect(
      dealStageUpdateInputSchema.safeParse({
        dealId: 'deal_1',
        stage: 'RESERVED',
      }).success,
    ).toBe(true);
  });

  it('rejects an unknown stage', () => {
    expect(
      dealStageUpdateInputSchema.safeParse({
        dealId: 'deal_1',
        stage: 'pending',
      }).success,
    ).toBe(false);
  });
});

describe('dealActivityInputSchema', () => {
  it('accepts a comment activity', () => {
    expect(
      dealActivityInputSchema.safeParse({
        dealId: 'deal_1',
        type: 'COMMENT',
        body: 'Called buyer; waiting for reply.',
      }).success,
    ).toBe(true);
  });

  it('rejects an empty body', () => {
    expect(
      dealActivityInputSchema.safeParse({
        dealId: 'deal_1',
        type: 'FOLLOW_UP',
        body: '   ',
      }).success,
    ).toBe(false);
  });
});

describe('manualDealInputSchema', () => {
  it('accepts a manual builder entry', () => {
    const parsed = manualDealInputSchema.parse({
      companyId: 'co_1',
      contactName: 'Karen Sargsyan',
      contactPhone: '+37499123456',
    });
    expect(parsed.source).toBe('MANUAL_BUILDER_ENTRY');
  });

  it('accepts optional email and apartment', () => {
    expect(
      manualDealInputSchema.safeParse({
        companyId: 'co_1',
        contactName: 'Karen',
        contactPhone: '+37499123456',
        contactEmail: 'karen@example.com',
        apartmentId: 'apt_1',
      }).success,
    ).toBe(true);
  });
});
