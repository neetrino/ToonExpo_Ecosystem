import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { AuthSession } from '@toonexpo/contracts';
import type { Request } from 'express';

import { SESSION_COOKIE_NAME } from './auth.constants';
import { SessionService } from './session.service';

export type RequestWithAuth = Request & {
  authSession?: AuthSession;
};

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly sessions: SessionService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = req.cookies?.[SESSION_COOKIE_NAME];
    const sessionToken = typeof token === 'string' && token.length > 0 ? token : undefined;
    const session = await this.sessions.resolveSession(sessionToken);
    if (!session) {
      throw new UnauthorizedException({
        code: 'UNAUTHORIZED',
        message: 'Not authenticated',
        error: 'unauthorized',
      });
    }
    req.authSession = session;
    return true;
  }
}
