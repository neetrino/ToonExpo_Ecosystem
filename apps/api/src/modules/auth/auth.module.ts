import { Module } from '@nestjs/common';

import { AccountInviteService } from './account-invite.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionAuthGuard } from './session-auth.guard';
import { SessionService } from './session.service';

@Module({
  controllers: [AuthController],
  providers: [AccountInviteService, AuthService, SessionService, SessionAuthGuard],
  exports: [AuthService, SessionService, SessionAuthGuard],
})
export class AuthModule {}
