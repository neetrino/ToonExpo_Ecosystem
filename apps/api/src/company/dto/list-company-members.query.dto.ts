import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import {
  COMPANY_MEMBERS_DEFAULT_PAGE_SIZE,
  COMPANY_MEMBERS_MAX_PAGE_SIZE,
  LIST_MIN_PAGE,
} from "../../common/constants/app.constants.js";

export class ListCompanyMembersQueryDto {
  @ApiPropertyOptional({ default: LIST_MIN_PAGE, minimum: LIST_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(LIST_MIN_PAGE)
  page: number = LIST_MIN_PAGE;

  @ApiPropertyOptional({
    default: COMPANY_MEMBERS_DEFAULT_PAGE_SIZE,
    minimum: 1,
    maximum: COMPANY_MEMBERS_MAX_PAGE_SIZE,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(COMPANY_MEMBERS_MAX_PAGE_SIZE)
  pageSize: number = COMPANY_MEMBERS_DEFAULT_PAGE_SIZE;
}
