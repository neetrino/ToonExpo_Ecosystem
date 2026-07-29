import { Injectable } from '@nestjs/common';
import type { AdminUserListItem, AdminUserListResponse } from '@toonexpo/contracts';
import type { Prisma } from '@toonexpo/db';

import { toUserResponse } from '../../auth/mappers/user.mapper.js';
import { PrismaService } from '../../prisma/prisma.service.js';
import type { ListAdminUsersQueryDto } from './dto/list-admin-users.query.dto.js';

const userListInclude = {
  companyMembership: {
    select: {
      companyId: true,
      role: true,
      company: { select: { name: true, type: true } },
    },
  },
} as const;

type UserListRow = Prisma.UserGetPayload<{ include: typeof userListInclude }>;

const toAdminUserListItem = (row: UserListRow): AdminUserListItem => {
  const base = toUserResponse(row);
  const membership = row.companyMembership;

  return {
    id: base.id,
    name: base.name,
    email: base.email,
    phone: base.phone,
    accountType: base.accountType,
    status: base.status,
    defaultLocale: base.defaultLocale,
    companyId: membership?.companyId ?? null,
    companyName: membership?.company.name ?? null,
    companyType: membership?.company.type ?? null,
    companyMemberRole: membership?.role ?? null,
    createdAt: base.createdAt,
    updatedAt: base.updatedAt,
  };
};

/**
 * Platform-admin user directory.
 */
@Injectable()
export class AdminUsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListAdminUsersQueryDto): Promise<AdminUserListResponse> {
    const where = this.buildWhere(query);
    const skip = (query.page - 1) * query.pageSize;

    const [total, rows] = await Promise.all([
      this.prisma.db.user.count({ where }),
      this.prisma.db.user.findMany({
        where,
        include: userListInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.pageSize,
      }),
    ]);

    return {
      data: rows.map(toAdminUserListItem),
      meta: {
        page: query.page,
        pageSize: query.pageSize,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / query.pageSize),
      },
    };
  }

  buildWhere(query: ListAdminUsersQueryDto): Prisma.UserWhereInput {
    const where: Prisma.UserWhereInput = {};

    if (query.accountType) {
      where.accountType = query.accountType;
    }
    if (query.status) {
      where.status = query.status;
    }

    const search = query.search?.trim();
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
