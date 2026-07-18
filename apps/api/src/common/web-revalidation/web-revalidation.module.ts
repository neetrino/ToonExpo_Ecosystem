import { Global, Module } from "@nestjs/common";

import { WebRevalidationService } from "./web-revalidation.service.js";

@Global()
@Module({
  providers: [WebRevalidationService],
  exports: [WebRevalidationService],
})
export class WebRevalidationModule {}
