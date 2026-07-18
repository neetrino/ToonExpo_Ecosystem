import { Body, Controller, Get, Post } from "@nestjs/common";
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from "@nestjs/swagger";
import type {
  MortgageCalculatorResult,
  PublicMortgageOfferListResponse,
} from "@toonexpo/contracts";

import { Public } from "../../auth/decorators/public.decorator.js";
import { MortgageCalculatorDto } from "./dto/mortgage-calculator.dto.js";
import { PublicMortgageService } from "./public-mortgage.service.js";

@ApiTags("public-mortgage")
@Public()
@Controller("mortgage")
export class PublicMortgageController {
  constructor(private readonly mortgage: PublicMortgageService) {}

  @Get("offers")
  @ApiOperation({ summary: "List published mortgage offers" })
  @ApiOkResponse({ description: "Published mortgage offers" })
  listOffers(): Promise<PublicMortgageOfferListResponse> {
    return this.mortgage.listOffers();
  }

  @Post("calculate")
  @ApiOperation({ summary: "Calculate estimated mortgage payment" })
  @ApiOkResponse({ description: "Mortgage calculation result" })
  calculate(@Body() body: MortgageCalculatorDto): Promise<MortgageCalculatorResult> {
    return this.mortgage.calculate(body);
  }
}
