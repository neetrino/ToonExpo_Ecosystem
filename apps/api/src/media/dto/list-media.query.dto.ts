import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

import {
  MEDIA_DEFAULT_PAGE_SIZE,
  MEDIA_MAX_PAGE_SIZE,
  MEDIA_MIN_PAGE,
} from "../media.constants.js";

export class ListMediaQueryDto {
  @ApiPropertyOptional({ default: MEDIA_MIN_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(MEDIA_MIN_PAGE)
  page: number = MEDIA_MIN_PAGE;

  @ApiPropertyOptional({ default: MEDIA_DEFAULT_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MEDIA_MAX_PAGE_SIZE)
  pageSize: number = MEDIA_DEFAULT_PAGE_SIZE;
}
