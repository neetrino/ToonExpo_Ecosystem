import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePortalPriceOnRequestDto {
  @ApiProperty({ description: 'Hide public prices and show a request CTA for this building' })
  @IsBoolean()
  enabled!: boolean;
}
