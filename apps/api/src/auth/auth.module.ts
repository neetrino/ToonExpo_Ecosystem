import { Module } from "@nestjs/common";
import { PassportModule } from "@nestjs/passport";

import { AccessTokensModule } from "../access-tokens/access-tokens.module.js";
import { QrModule } from "../qr/qr.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { SessionCookieService } from "./session-cookie.service.js";
import { SessionStrategy } from "./strategies/session.strategy.js";

@Module({
  imports: [
    PassportModule.register({ session: false }),
    AccessTokensModule,
    QrModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, SessionCookieService, SessionStrategy],
  exports: [AuthService],
})
export class AuthModule {}
