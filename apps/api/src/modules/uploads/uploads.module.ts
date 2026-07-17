import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { UploadAuthService } from './upload-auth.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [UploadsService, UploadAuthService],
})
export class UploadsModule {}
