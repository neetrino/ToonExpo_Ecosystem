import {
  type CanActivate,
  type ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

import { loadApiEnv } from '../../../common/env';
import { createAppLogger } from '../../../common/logger';
import {
  allowBosProvisioningRequest,
  bosRateLimitKey,
  RATE_LIMITED_HTTP_CODE,
} from '../../../common/rate-limit';

import { checkBosApiKey } from './bos-api-key';
import { BOS_API_KEY_HEADER } from './bos-provisioning.constants';

const logger = createAppLogger('bos-api-key-guard');

function resolveRequestIp(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    const firstHop = forwarded.split(',')[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    const firstHop = forwarded[0].split(',')[0]?.trim();
    if (firstHop) {
      return firstHop;
    }
  }
  return request.ip || 'unknown';
}

@Injectable()
export class BosApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const env = loadApiEnv();
    const request = context.switchToHttp().getRequest<Request>();
    const headerValue = request.header(BOS_API_KEY_HEADER) ?? undefined;
    const result = checkBosApiKey(env.BOS_API_KEY, headerValue);

    if (result === 'disabled') {
      logger.warn({ result: 'disabled' }, 'BOS integration disabled (API key unset)');
      throw new ServiceUnavailableException({
        code: 'INTEGRATION_DISABLED',
        message: 'BOS integration is disabled',
      });
    }
    if (result === 'unauthorized') {
      logger.warn({ result: 'unauthorized' }, 'BOS API key rejected');
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Invalid or missing BOS API key',
      });
    }

    const rateKey = bosRateLimitKey(headerValue, resolveRequestIp(request));
    const allowed = await allowBosProvisioningRequest(rateKey);
    if (!allowed) {
      logger.warn({ rateKey }, 'BOS provisioning rate limited');
      throw new HttpException(
        {
          code: RATE_LIMITED_HTTP_CODE,
          message: 'Too many provisioning requests. Try again later.',
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }
}
