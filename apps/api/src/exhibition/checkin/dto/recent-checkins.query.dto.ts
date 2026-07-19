import { IsString, MinLength } from "class-validator";

export class RecentCheckInsQueryDto {
  @IsString()
  @MinLength(1)
  eventId!: string;
}
