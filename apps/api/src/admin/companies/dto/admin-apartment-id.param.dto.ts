import { IsString, MinLength } from 'class-validator';

/**
 * Path param for admin apartment routes.
 */
export class AdminApartmentIdParamDto {
  @IsString()
  @MinLength(1)
  apartmentId!: string;
}
