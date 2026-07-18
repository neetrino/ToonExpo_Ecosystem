import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AuthGuard } from "@nestjs/passport";
import type { Observable } from "rxjs";

import { IS_OPTIONAL_AUTH_KEY } from "../decorators/optional-auth.decorator.js";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator.js";

/**
 * Global session guard: allows @Public() routes, otherwise requires Passport session strategy.
 * With @OptionalAuth(), attempts session resolution without rejecting anonymous callers.
 */
@Injectable()
export class SessionAuthGuard
  extends AuthGuard("session")
  implements CanActivate
{
  constructor(private readonly reflector: Reflector) {
    super();
  }

  override canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isOptionalAuth) {
      return this.activateOptional(context);
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }

  override handleRequest<TUser>(
    err: Error | null,
    user: TUser | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const isOptionalAuth = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (isOptionalAuth) {
      if (err || !user) {
        return null as TUser;
      }
      return user;
    }

    if (err || !user) {
      throw err ?? new UnauthorizedException("Authentication required");
    }

    return user;
  }

  private async activateOptional(context: ExecutionContext): Promise<boolean> {
    try {
      await super.canActivate(context);
      return true;
    } catch {
      return true;
    }
  }
}
