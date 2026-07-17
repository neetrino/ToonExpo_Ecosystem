import {
  Catch,
  type ExceptionFilter,
  type ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

/**
 * Flattens Nest HttpException payloads that already carry `{ code, message }`
 * so API clients can read top-level `code` consistently.
 */
@Catch(HttpException)
export class ApiHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status = exception.getStatus();
    const payload = exception.getResponse();

    if (
      typeof payload === 'object' &&
      payload !== null &&
      ('code' in payload || 'error' in payload)
    ) {
      response.status(status).json(payload);
      return;
    }

    if (typeof payload === 'string') {
      response.status(status).json({
        code: 'UNKNOWN',
        message: payload,
      });
      return;
    }

    const message =
      typeof payload === 'object' &&
      payload !== null &&
      'message' in payload &&
      typeof (payload as { message: unknown }).message === 'string'
        ? (payload as { message: string }).message
        : 'Request failed';

    response.status(status).json({
      statusCode: status,
      code: status === HttpStatus.UNAUTHORIZED ? 'UNAUTHORIZED' : 'UNKNOWN',
      message,
    });
  }
}
