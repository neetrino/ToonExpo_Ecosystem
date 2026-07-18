import { IsString, MinLength } from "class-validator";

export class CheckInScanDto {
  @IsString()
  @MinLength(1)
  token!: string;

  @IsString()
  @MinLength(1)
  eventId!: string;
}
