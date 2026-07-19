import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import {
  PORTAL_DEFAULT_PAGE_SIZE,
  PORTAL_MAX_PAGE_SIZE,
  PORTAL_MIN_PAGE,
} from "../portal.constants.js";

export class ListPortalProjectsQueryDto {
  @ApiPropertyOptional({ default: PORTAL_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(PORTAL_MIN_PAGE)
  page: number = PORTAL_MIN_PAGE;

  @ApiPropertyOptional({ default: PORTAL_DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(PORTAL_MAX_PAGE_SIZE)
  pageSize: number = PORTAL_DEFAULT_PAGE_SIZE;
}
