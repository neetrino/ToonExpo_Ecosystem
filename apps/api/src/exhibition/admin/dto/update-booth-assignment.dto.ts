import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
  ValidateIf,
} from "class-validator";

export class UpdateBoothAssignmentDto {
  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsString()
  @MinLength(1)
  companyId?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsString()
  @MinLength(1)
  projectId?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsString()
  assignmentLabel?: string | null;

  @IsOptional()
  @ValidateIf((_obj, value) => value != null)
  @IsInt()
  sortOrder?: number | null;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
