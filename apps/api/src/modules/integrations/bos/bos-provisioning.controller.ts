import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  Inject,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';

import { BosApiKeyGuard } from './bos-api-key.guard';
import { BOS_API_KEY_HEADER } from './bos-provisioning.constants';
import { BosProvisioningService } from './bos-provisioning.service';

@ApiTags('integrations')
@ApiSecurity('bos-api-key')
@Controller('integrations/bos')
export class BosProvisioningController {
  constructor(
    @Inject(BosProvisioningService) private readonly provisioning: BosProvisioningService,
  ) {}

  @Post('provisioning')
  @HttpCode(201)
  @UseGuards(BosApiKeyGuard)
  @ApiOperation({
    summary: 'BOS account provisioning',
    description:
      'Creates or idempotently returns ToonExpo company/user access for an approved BOS participant.',
  })
  @ApiHeader({
    name: BOS_API_KEY_HEADER,
    description: 'Shared secret (BOS_API_KEY). Missing/invalid → 401; unset env → 503.',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Account provisioned' })
  @ApiResponse({ status: 200, description: 'Idempotent replay of a prior result' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Missing or invalid API key' })
  @ApiResponse({ status: 409, description: 'Email already registered' })
  @ApiResponse({ status: 503, description: 'Integration disabled (BOS_API_KEY unset)' })
  async provision(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const outcome = await this.provisioning.provision(body);

    if (outcome.kind === 'validation') {
      throw new BadRequestException({
        code: 'VALIDATION_ERROR',
        message: 'Invalid provisioning payload',
        issues: outcome.issues,
      });
    }

    res.status(outcome.httpStatus);
    return outcome.response;
  }
}
