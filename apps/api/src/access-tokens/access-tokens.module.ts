import { Module } from "@nestjs/common";

import { EmailModule } from "../email/email.module.js";
import { AccessTokenService } from "./access-token.service.js";
import { InviteMailerService } from "./invite-mailer.service.js";

@Module({
  imports: [EmailModule],
  providers: [AccessTokenService, InviteMailerService],
  exports: [AccessTokenService, InviteMailerService],
})
export class AccessTokensModule {}
