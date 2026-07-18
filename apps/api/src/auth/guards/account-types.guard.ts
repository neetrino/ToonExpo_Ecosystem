import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { AccountType } from "@toonexpo/contracts";
import type { Request } from "express";

import { ACCOUNT_TYPES_KEY } from "../decorators/account-types.decorator.js";
import type { AuthenticatedUser } from "../types/authenticated-user.js";

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

/**
 * Enforces @AccountTypes(...) metadata against the authenticated user's account type.
 */
@Injectable()
export class AccountTypesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTypes = this.reflector.getAllAndOverride<
      AccountType[] | undefined
    >(ACCOUNT_TYPES_KEY, [context.getHandler(), context.getClass()]);

    if (!requiredTypes || requiredTypes.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException("Insufficient permissions");
    }

    if (!requiredTypes.includes(user.accountType)) {
      throw new ForbiddenException("Insufficient permissions");
    }

    return true;
  }
}
