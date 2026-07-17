import {
  type CanActivate,
  type ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { loadApiEnv } from '../../common/env';

/**
 * Rejects credentialed mutating requests whose Origin/Referer is not APP_URL.
 * Same-origin rewrites typically omit cross-site Origin mismatches.
 */
@Injectable()
export class AppOriginGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return true;
    }

    const env = loadApiEnv();
    const allowed = new URL(env.APP_URL).origin;
    const origin = req.headers.origin;
    if (origin) {
      if (origin === allowed) {
        return true;
      }
      throw new ForbiddenException({
        code: 'FORBIDDEN_ORIGIN',
        message: 'Request origin is not allowed',
      });
    }

    const referer = req.headers.referer;
    if (referer) {
      try {
        if (new URL(referer).origin === allowed) {
          return true;
        }
      } catch {
        // fall through
      }
      throw new ForbiddenException({
        code: 'FORBIDDEN_ORIGIN',
        message: 'Request referer is not allowed',
      });
    }

    // Non-browser clients (tests, server-to-server) may omit both; allow.
    return true;
  }
}
