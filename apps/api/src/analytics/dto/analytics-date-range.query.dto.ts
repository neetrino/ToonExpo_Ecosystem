import { IsDateString, IsOptional } from "class-validator";

/** Shared from/to filter for analytics dashboards. */
export class AnalyticsDateRangeQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
