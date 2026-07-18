import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { PlatformRole } from "@toonexpo/contracts";
import type { Request } from "express";

import { ROLES_KEY } from "../decorators/roles.decorator.js";
import type { AuthenticatedUser } from "../types/authenticated-user.js";

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

/**
 * Enforces @Roles(...) metadata against the authenticated user's platform role.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<
      PlatformRole[] | undefined
    >(ROLES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Insufficient permissions");
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
