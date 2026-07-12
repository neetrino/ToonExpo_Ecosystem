import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import pino from 'pino';

import { loadApiEnv } from '../../../common/env';

import { checkBosApiKey } from './bos-api-key';
import { BOS_API_KEY_HEADER } from './bos-provisioning.constants';

const logger = pino({ name: 'bos-api-key-guard' });

@Injectable()
export class BosApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
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
    return true;
  }
}
