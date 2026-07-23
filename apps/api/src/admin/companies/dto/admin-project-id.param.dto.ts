import { IsString, MinLength } from 'class-validator';

/**
 * Path param for admin project routes.
 */
export class AdminProjectIdParamDto {
  @IsString()
  @MinLength(1)
  projectId!: string;
}
