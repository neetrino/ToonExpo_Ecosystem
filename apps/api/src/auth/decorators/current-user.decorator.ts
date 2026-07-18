import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Request } from "express";

import type { AuthenticatedUser } from "../types/authenticated-user.js";

type RequestWithUser = Request & {
  user?: AuthenticatedUser;
};

/**
 * Extracts the authenticated user attached by the session strategy/guard.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new Error("CurrentUser used on an unauthenticated request");
    }

    return user;
  },
);
