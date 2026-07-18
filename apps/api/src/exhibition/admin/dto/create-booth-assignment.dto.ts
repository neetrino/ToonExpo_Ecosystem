import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from "class-validator";

export class CreateBoothAssignmentDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  companyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  projectId?: string;

  @IsOptional()
  @IsString()
  assignmentLabel?: string;

  @IsOptional()
  @IsInt()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
