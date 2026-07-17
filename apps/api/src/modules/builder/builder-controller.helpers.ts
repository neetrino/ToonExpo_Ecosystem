import { HttpException, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';

import type { RequestWithAuth } from '../auth/session-auth.guard';
import type { BuilderContext } from './builder-context.service';

export function requireSession(request: RequestWithAuth) {
  if (!request.authSession) {
    throw new UnauthorizedException({ error: 'unauthorized' });
  }
  return request.authSession;
}

export function parse<TSchema extends z.ZodTypeAny>(
  schema: TSchema,
  body: unknown,
): z.output<TSchema> {
  const parsed = schema.safeParse(body);
  if (!parsed.success) throwInvalid();
  return parsed.data;
}

export function throwInvalid(): never {
  throw new HttpException({ error: 'invalidInput' }, HttpStatus.BAD_REQUEST);
}

export function actor(context: BuilderContext) {
  return { userId: context.session.user.id, role: context.session.user.role };
}

export function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}
