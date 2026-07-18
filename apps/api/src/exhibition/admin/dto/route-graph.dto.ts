import { Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";

import type { RouteNodeType } from "@toonexpo/contracts";

const ROUTE_NODE_TYPES = [
  "entrance",
  "intersection",
  "booth",
  "info",
  "other",
] as const satisfies readonly RouteNodeType[];

export class RouteNodeDto {
  @IsString()
  @MinLength(1)
  id!: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  label?: string;

  @IsNumber()
  xPercent!: number;

  @IsNumber()
  yPercent!: number;

  @IsIn(ROUTE_NODE_TYPES)
  type!: RouteNodeType;

  @IsOptional()
  @IsString()
  boothId?: string;
}

export class RouteEdgeDto {
  @IsString()
  @MinLength(1)
  fromNodeId!: string;

  @IsString()
  @MinLength(1)
  toNodeId!: string;

  @IsOptional()
  @IsNumber()
  weight?: number;

  @IsOptional()
  @IsBoolean()
  accessible?: boolean;
}

export class RouteGraphDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteNodeDto)
  nodes!: RouteNodeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteEdgeDto)
  edges!: RouteEdgeDto[];
}
