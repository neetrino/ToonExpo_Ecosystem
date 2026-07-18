import { Module } from "@nestjs/common";

import { AccessTokensModule } from "../access-tokens/access-tokens.module.js";
import { CompanyMembersController } from "./company-members.controller.js";
import { CompanyMembersService } from "./company-members.service.js";
import { CompanyProfileController } from "./company-profile.controller.js";
import { CompanyProfileService } from "./company-profile.service.js";
import { CompanyAdminGuard } from "./guards/company-admin.guard.js";
import { CompanyMemberGuard } from "./guards/company-member.guard.js";

@Module({
  imports: [AccessTokensModule],
  controllers: [CompanyProfileController, CompanyMembersController],
  providers: [
    CompanyMembersService,
    CompanyProfileService,
    CompanyAdminGuard,
    CompanyMemberGuard,
  ],
  exports: [CompanyAdminGuard, CompanyMemberGuard],
})
export class CompanyMembersModule {}
