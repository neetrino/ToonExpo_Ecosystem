import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { AdminUserListResponse } from '@toonexpo/contracts';

import { AccountTypes } from '../../auth/decorators/account-types.decorator.js';
import { AdminUsersService } from './admin-users.service.js';
import { ListAdminUsersQueryDto } from './dto/list-admin-users.query.dto.js';

@ApiTags('admin-users')
@AccountTypes('platform_admin')
@Controller('admin/users')
export class AdminUsersController {
  constructor(private readonly usersService: AdminUsersService) {}

  @Get()
  @ApiOperation({ summary: 'List platform users (paginated)' })
  @ApiOkResponse({ description: 'Paginated user list' })
  list(@Query() query: ListAdminUsersQueryDto): Promise<AdminUserListResponse> {
    return this.usersService.list(query);
  }
}
