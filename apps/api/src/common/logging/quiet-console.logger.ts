import { ConsoleLogger } from '@nestjs/common';

/** Nest boot contexts that dump one line per module/route — too noisy for local terminals. */
const MUTED_LOG_CONTEXTS = new Set(['InstanceLoader', 'RoutesResolver', 'RouterExplorer']);

/**
 * Nest ConsoleLogger that keeps colors but skips verbose DI/route mapping spam.
 * Still shows NestFactory / NestApplication / feature loggers (rate-limit, etc.).
 */
export class QuietConsoleLogger extends ConsoleLogger {
  override log(message: unknown, context?: string): void {
    if (typeof context === 'string' && MUTED_LOG_CONTEXTS.has(context)) {
      return;
    }

    super.log(message, context);
  }
}
