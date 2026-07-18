import { Module } from "@nestjs/common";

import { AccessTokensModule } from "../../access-tokens/access-tokens.module.js";
import { AdminCompaniesController } from "./admin-companies.controller.js";
import { AdminCompaniesService } from "./admin-companies.service.js";

@Module({
  imports: [AccessTokensModule],
  controllers: [AdminCompaniesController],
  providers: [AdminCompaniesService],
})
export class AdminCompaniesModule {}
