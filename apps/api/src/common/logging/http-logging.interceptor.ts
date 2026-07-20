import {
  type CallHandler,
  type ExecutionContext,
  Injectable,
  Logger,
  type NestInterceptor,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { type Observable } from 'rxjs';

import { NODE_ENV_DEVELOPMENT } from '../constants/app.constants.js';

const pathWithoutQuery = (url: string | undefined): string => {
  if (!url) {
    return '?';
  }

  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? url : url.slice(0, queryIndex);
};

/**
 * Local/dev HTTP access lines in Nest ConsoleLogger style (GymHub-like):
 * `→ GET /api/v1/...` then `← GET /api/v1/... 200 12ms`.
 * Production keeps nestjs-pino autoLogging instead.
 */
@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP');
  private readonly enabled = process.env['NODE_ENV'] === NODE_ENV_DEVELOPMENT;

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (!this.enabled || context.getType() !== 'http') {
      return next.handle();
    }

    const http = context.switchToHttp();
    const req = http.getRequest<Request>();
    const res = http.getResponse<Response>();
    const method = req.method ?? '?';
    const path = pathWithoutQuery(req.originalUrl ?? req.url);
    const startedAt = Date.now();

    this.logger.log(`→ ${method} ${path}`);

    res.on('finish', () => {
      const durationMs = Date.now() - startedAt;
      this.logger.log(`← ${method} ${path} ${String(res.statusCode)} ${String(durationMs)}ms`);
    });

    return next.handle();
  }
}
