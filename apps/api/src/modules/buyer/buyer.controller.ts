import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Inject,
  Patch,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  buyerProfileUpdateInputSchema,
  type BuyerProfile,
  type BuyerProfileUpdateResponse,
} from '@toonexpo/contracts';

import { AppOriginGuard } from '../auth/app-origin.guard';
import { CsrfGuard } from '../auth/csrf.guard';
import { SessionAuthGuard, type RequestWithAuth } from '../auth/session-auth.guard';
import { BuyerService } from './buyer.service';

@ApiTags('buyer')
@ApiCookieAuth()
@Controller('buyer')
@UseGuards(AppOriginGuard, SessionAuthGuard, CsrfGuard)
export class BuyerController {
  constructor(@Inject(BuyerService) private readonly buyer: BuyerService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get the signed-in buyer profile' })
  @ApiResponse({ status: 200, description: 'Buyer profile' })
  async getProfile(@Req() request: RequestWithAuth): Promise<BuyerProfile> {
    const profile = await this.buyer.getProfile(requireBuyerId(request));
    if (!profile) {
      throwApiError('notFound', HttpStatus.NOT_FOUND);
    }
    return profile;
  }

  @Patch('profile')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update the signed-in buyer name and phone' })
  async updateProfile(
    @Body() body: unknown,
    @Req() request: RequestWithAuth,
  ): Promise<BuyerProfileUpdateResponse> {
    const parsed = buyerProfileUpdateInputSchema.safeParse(body);
    if (!parsed.success) {
      throwApiError('invalidInput', HttpStatus.BAD_REQUEST);
    }

    const result = await this.buyer.updateProfile(requireBuyerId(request), parsed.data);
    if (!result) {
      throwApiError('notFound', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}

function requireBuyerId(request: RequestWithAuth): string {
  const session = request.authSession;
  if (!session || session.user.role !== 'BUYER') {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return session.user.id;
}

function throwApiError(error: string, status: HttpStatus): never {
  throw new HttpException({ error }, status);
}
