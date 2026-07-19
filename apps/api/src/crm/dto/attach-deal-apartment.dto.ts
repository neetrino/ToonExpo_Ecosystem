import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class AttachCrmDealApartmentDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  apartmentId!: string;
}
