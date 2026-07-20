import { RequestMethod } from '@nestjs/common';
import type { Params } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { NODE_ENV_PRODUCTION } from '../common/constants/app.constants.js';

const isProduction = process.env['NODE_ENV'] === NODE_ENV_PRODUCTION;

const pathWithoutQuery = (url: string | undefined): string => {
  if (!url) {
    return '?';
  }

  const queryIndex = url.indexOf('?');
  return queryIndex === -1 ? url : url.slice(0, queryIndex);
};

/**
 * Production: structured Pino HTTP access logs.
 * Local/test: nestjs-pino stays for InjectPinoLogger; HTTP lines come from
 * {@link HttpLoggingInterceptor} (Nest ConsoleLogger `→` / `←` style).
 */
export const buildLoggerModuleParams = (): Params => ({
  // Nest 11 / path-to-regexp: named wildcard (nestjs-pino default `*` warns).
  forRoutes: [{ path: '{*path}', method: RequestMethod.ALL }],
  pinoHttp: {
    level: process.env['LOG_LEVEL']?.trim() || 'info',
    autoLogging: isProduction,
    quietReqLogger: true,
    quietResLogger: true,
    serializers: {
      req: (req: IncomingMessage) => ({
        id: (req as IncomingMessage & { id?: number | string }).id,
        method: req.method,
        path: pathWithoutQuery(req.url),
      }),
      res: (res: ServerResponse) => ({
        statusCode: res.statusCode,
      }),
    },
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse, responseTime: number) =>
      `${req.method ?? '?'} ${pathWithoutQuery(req.url)} ${String(res.statusCode)} ${Math.round(responseTime)}ms`,
    customErrorMessage: (req: IncomingMessage, res: ServerResponse, error: Error) =>
      `${req.method ?? '?'} ${pathWithoutQuery(req.url)} ${String(res.statusCode)} — ${error.message}`,
    redact: {
      paths: ['req.headers.authorization', 'req.headers.cookie', "res.headers['set-cookie']"],
      remove: true,
    },
    ...(isProduction
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              singleLine: true,
              translateTime: 'HH:MM:ss',
              ignore: 'pid,hostname,req,res,responseTime',
              messageFormat: '{msg}',
            },
          },
        }),
  },
});
