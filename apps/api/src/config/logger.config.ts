import { RequestMethod } from '@nestjs/common';
import type { Params } from 'nestjs-pino';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { NODE_ENV_PRODUCTION } from '../common/constants/app.constants.js';

const isProduction = process.env['NODE_ENV'] === NODE_ENV_PRODUCTION;

/**
 * Compact HTTP access logging for nestjs-pino (no header dumps in the terminal).
 */
export const buildLoggerModuleParams = (): Params => ({
  // Nest 11 / path-to-regexp: named wildcard (nestjs-pino default `*` warns).
  forRoutes: [{ path: '{*path}', method: RequestMethod.ALL }],
  pinoHttp: {
    quietReqLogger: true,
    quietResLogger: true,
    serializers: {
      req: (req: IncomingMessage) => ({
        method: req.method,
        url: req.url,
      }),
      res: (res: ServerResponse) => ({
        statusCode: res.statusCode,
      }),
    },
    customSuccessMessage: (req: IncomingMessage, res: ServerResponse, responseTime: number) =>
      `${req.method ?? '?'} ${req.url ?? '?'} ${String(res.statusCode)} ${Math.round(responseTime)}ms`,
    customErrorMessage: (req: IncomingMessage, res: ServerResponse, error: Error) =>
      `${req.method ?? '?'} ${req.url ?? '?'} ${String(res.statusCode)} — ${error.message}`,
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
              translateTime: 'HH:MM:ss.l',
              ignore: 'pid,hostname,req,res,responseTime',
              messageFormat: '{msg}',
            },
          },
        }),
  },
});
