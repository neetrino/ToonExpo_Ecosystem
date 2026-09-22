import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdatePortalPriceOnRequestDto {
  @ApiProperty({
    description:
      'Hide public prices and show a request CTA (building or project; project cascades to buildings)',
  })
  @IsBoolean()
  enabled!: boolean;
}
