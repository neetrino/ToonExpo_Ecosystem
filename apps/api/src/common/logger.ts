import pino, { type Logger } from 'pino';

/**
 * App logger: JSON in production, pretty console lines in development.
 */
export function createAppLogger(name: string): Logger {
  const isProd = process.env.NODE_ENV === 'production';

  return pino({
    name,
    level: isProd ? 'info' : 'debug',
    ...(isProd
      ? {}
      : {
          transport: {
            target: 'pino-pretty',
            options: {
              colorize: true,
              translateTime: 'SYS:HH:MM:ss',
              ignore: 'pid,hostname',
            },
          },
        }),
  });
}
