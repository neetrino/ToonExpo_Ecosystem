import { IsString, MinLength } from "class-validator";

export class RouteQueryDto {
  @IsString()
  @MinLength(1)
  fromNodeId!: string;

  @IsString()
  @MinLength(1)
  toBoothId!: string;
}
