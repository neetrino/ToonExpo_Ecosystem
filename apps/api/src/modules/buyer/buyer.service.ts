import { Inject, Injectable } from '@nestjs/common';
import type {
  BuyerProfile,
  BuyerProfileUpdateInput,
  BuyerProfileUpdateResponse,
} from '@toonexpo/contracts';

import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class BuyerService {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) {}

  getProfile(userId: string): Promise<BuyerProfile | null> {
    return this.prisma.client.user.findFirst({
      where: { id: userId, role: 'BUYER' },
      select: { name: true, email: true, phone: true },
    });
  }

  async updateProfile(
    userId: string,
    input: BuyerProfileUpdateInput,
  ): Promise<BuyerProfileUpdateResponse | null> {
    const result = await this.prisma.client.user.updateMany({
      where: { id: userId, role: 'BUYER' },
      data: { name: input.name, phone: input.phone ?? null },
    });
    return result.count > 0 ? { ok: true } : null;
  }
}
