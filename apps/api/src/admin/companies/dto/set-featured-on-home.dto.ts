import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

/**
 * Body to pin/unpin a catalog entity on the public homepage.
 */
export class SetFeaturedOnHomeDto {
  @ApiProperty({ description: 'Whether the entity should appear on the homepage' })
  @IsBoolean()
  featuredOnHome!: boolean;
}
