import { ForbiddenException, Injectable } from '@nestjs/common';
import type { CanActivate, ExecutionContext } from '@nestjs/common';

import type { RequestWithAuth } from '../auth/session-auth.guard';

@Injectable()
export class AdminRoleGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    if (request.authSession?.user.role === 'BIGPROJECTS_ADMIN') {
      return true;
    }
    throw new ForbiddenException({
      code: 'ADMIN_REQUIRED',
      message: 'BigProjects admin role required',
    });
  }
}
