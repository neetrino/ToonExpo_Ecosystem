import { describe, expect, it } from 'vitest';

import { companyProfileUpdateInputSchema } from './company';

describe('companyProfileUpdateInputSchema', () => {
  it('accepts a valid profile update payload', () => {
    const result = companyProfileUpdateInputSchema.safeParse({
      name: 'Sunrise Development',
      description: 'Premium residential developer in Yerevan.',
      logoUrl: 'https://picsum.photos/seed/logo/200/200',
      phone: '+37410000000',
      email: 'info@sunrise-demo.local',
      website: 'https://example.com/sunrise',
      city: 'Yerevan',
      address: '12 Abovyan Street',
    });
    expect(result.success).toBe(true);
  });

  it('rejects javascript and data URL schemes on logo and website', () => {
    const logo = companyProfileUpdateInputSchema.safeParse({
      name: 'Evil Builder',
      logoUrl: 'javascript:alert(1)',
    });
    const website = companyProfileUpdateInputSchema.safeParse({
      name: 'Evil Builder',
      website: 'data:text/html,evil',
    });
    expect(logo.success).toBe(false);
    expect(website.success).toBe(false);
  });

  it('rejects empty company name', () => {
    const result = companyProfileUpdateInputSchema.safeParse({ name: '' });
    expect(result.success).toBe(false);
  });
});
