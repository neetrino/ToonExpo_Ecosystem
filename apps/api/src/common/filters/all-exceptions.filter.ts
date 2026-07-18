import {
  Catch,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  type ArgumentsHost,
  type ExceptionFilter,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SentryExceptionCaptured } from "@sentry/nestjs";
import type { Request, Response } from "express";

import { NODE_ENV_PRODUCTION } from "../constants/app.constants.js";
import type { AppEnv } from "../../config/env.validation.js";

type ErrorBody = {
  statusCode: number;
  message: string | string[];
  error: string;
  path: string;
  timestamp: string;
};

@Catch()
@Injectable()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly configService: ConfigService<AppEnv, true>) {}

  @SentryExceptionCaptured()
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const response = http.getResponse<Response>();
    const request = http.getRequest<Request>();
    const body = this.toErrorBody(exception, request.url);

    this.logger.error(
      {
        err: exception,
        path: request.url,
        method: request.method,
        statusCode: body.statusCode,
      },
      typeof body.message === "string" ? body.message : body.message.join("; "),
    );

    response.status(body.statusCode).json(body);
  }

  private toErrorBody(exception: unknown, path: string): ErrorBody {
    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, path, timestamp);
    }

    const nodeEnv = this.configService.get("NODE_ENV", { infer: true });
    const isProduction = nodeEnv === NODE_ENV_PRODUCTION;

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: isProduction
        ? "Internal server error"
        : this.unknownMessage(exception),
      error: "Internal Server Error",
      path,
      timestamp,
    };
  }

  private fromHttpException(
    exception: HttpException,
    path: string,
    timestamp: string,
  ): ErrorBody {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    if (typeof exceptionResponse === "string") {
      return {
        statusCode,
        message: exceptionResponse,
        error: exception.name,
        path,
        timestamp,
      };
    }

    const payload = exceptionResponse as Record<string, unknown>;
    const message = payload["message"];
    const error = payload["error"];

    return {
      statusCode,
      message: this.normalizeMessage(message, exception.message),
      error: typeof error === "string" ? error : exception.name,
      path,
      timestamp,
    };
  }

  private normalizeMessage(
    message: unknown,
    fallback: string,
  ): string | string[] {
    if (typeof message === "string") {
      return message;
    }

    if (
      Array.isArray(message) &&
      message.every((item) => typeof item === "string")
    ) {
      return message;
    }

    return fallback;
  }

  private unknownMessage(exception: unknown): string {
    if (exception instanceof Error) {
      return exception.message;
    }

    return "Internal server error";
  }
}
