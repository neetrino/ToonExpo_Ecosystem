import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { AdminController } from './admin.controller';
import { AdminMutationService } from './admin-mutation.service';
import { AdminQueryService } from './admin-query.service';
import { AdminReportService } from './admin-report.service';
import { AdminRoleGuard } from './admin-role.guard';

@Module({
  imports: [AuthModule],
  controllers: [AdminController],
  providers: [AdminRoleGuard, AdminQueryService, AdminMutationService, AdminReportService],
})
export class AdminModule {}
