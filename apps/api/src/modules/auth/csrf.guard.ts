import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from './auth.constants';

/**
 * Double-submit CSRF: readable cookie must match `x-csrf-token` header on mutations.
 * GET /auth/csrf issues the cookie before login/register/logout.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
      return true;
    }

    const cookieToken = req.cookies?.[CSRF_COOKIE_NAME];
    const headerToken = req.headers[CSRF_HEADER_NAME];
    const headerValue = Array.isArray(headerToken) ? headerToken[0] : headerToken;

    if (
      typeof cookieToken === 'string' &&
      cookieToken.length > 0 &&
      typeof headerValue === 'string' &&
      headerValue.length > 0 &&
      cookieToken === headerValue
    ) {
      return true;
    }

    throw new ForbiddenException({
      code: 'CSRF_REJECTED',
      message: 'CSRF token missing or invalid',
    });
  }
}
