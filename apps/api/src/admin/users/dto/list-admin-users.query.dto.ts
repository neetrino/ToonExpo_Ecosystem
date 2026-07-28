import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { AccountType, UserStatus } from '@toonexpo/db';

import {
  ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
  ADMIN_COMPANIES_MAX_PAGE_SIZE,
  LIST_MIN_PAGE,
} from '../../../common/constants/app.constants.js';

enum AccountTypeDto {
  buyer = 'buyer',
  platform_admin = 'platform_admin',
  entrance_staff = 'entrance_staff',
  company_member = 'company_member',
}

enum UserStatusDto {
  invited = 'invited',
  active = 'active',
  inactive = 'inactive',
  blocked = 'blocked',
}

const USER_SEARCH_MIN_LENGTH = 1;
const USER_SEARCH_MAX_LENGTH = 120;

export class ListAdminUsersQueryDto {
  @ApiPropertyOptional({ default: LIST_MIN_PAGE, minimum: LIST_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(LIST_MIN_PAGE)
  page: number = LIST_MIN_PAGE;

  @ApiPropertyOptional({
    default: ADMIN_COMPANIES_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: ADMIN_COMPANIES_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(ADMIN_COMPANIES_MAX_PAGE_SIZE)
  pageSize: number = ADMIN_COMPANIES_DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ enum: AccountTypeDto })
  @IsOptional()
  @IsEnum(AccountTypeDto)
  accountType?: AccountType;

  @ApiPropertyOptional({ enum: UserStatusDto })
  @IsOptional()
  @IsEnum(UserStatusDto)
  status?: UserStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(USER_SEARCH_MIN_LENGTH)
  @MaxLength(USER_SEARCH_MAX_LENGTH)
  search?: string;
}
