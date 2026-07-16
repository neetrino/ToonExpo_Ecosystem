import { Injectable } from '@nestjs/common';
import { prisma, type PrismaClient } from '@toonexpo/db';

@Injectable()
export class PrismaService {
  readonly client: PrismaClient = prisma;
}
