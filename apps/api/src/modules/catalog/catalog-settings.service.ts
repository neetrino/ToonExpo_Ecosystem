import { Inject, Injectable } from '@nestjs/common';

import { PrismaService } from '../../common/prisma.service';

export type PublicPlatformSettings = {
  contact: {
    email: string | null;
    phone: string | null;
  };
  mortgagePageEnabled: boolean;
};

const PUBLIC_SETTING_KEYS = [
  'CONTACT_EMAIL',
  'CONTACT_PHONE',
  'MORTGAGE_PAGE_ENABLED',
] as const;

@Injectable()
export class CatalogSettingsService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  async load(): Promise<PublicPlatformSettings> {
    const rows = await this.prisma.client.platformSetting.findMany({
      where: { key: { in: [...PUBLIC_SETTING_KEYS] } },
      select: { key: true, value: true },
    });
    const byKey = new Map(rows.map((row) => [row.key, row.value]));
    return {
      contact: {
        email: byKey.get('CONTACT_EMAIL') ?? null,
        phone: byKey.get('CONTACT_PHONE') ?? null,
      },
      mortgagePageEnabled: byKey.get('MORTGAGE_PAGE_ENABLED') !== 'false',
    };
  }
}
