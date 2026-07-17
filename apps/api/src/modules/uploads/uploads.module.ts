import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { UploadAuthService } from './upload-auth.service';
import { R2DeleteService } from './r2-delete.service';
import { UploadsController } from './uploads.controller';
import { UploadsService } from './uploads.service';

@Module({
  imports: [AuthModule],
  controllers: [UploadsController],
  providers: [UploadsService, UploadAuthService, R2DeleteService],
  exports: [R2DeleteService],
})
export class UploadsModule {}
