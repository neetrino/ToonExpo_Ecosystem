import { DEFAULT_NEON_AUTO_SUSPEND_MS } from '@toonexpo/db';

const ANSI_RED = '\x1b[31m';
const ANSI_DIM = '\x1b[2m';
const ANSI_RESET = '\x1b[0m';

/**
 * Development-only console notice when Neon is expected to auto-suspend
 * after a period with no pool checkouts (no keepalive / no DB pings).
 */
export class NeonIdleConsoleNotifier {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private announced = false;
  private readonly suspendAfterMs: number;

  constructor(suspendAfterMs: number = DEFAULT_NEON_AUTO_SUSPEND_MS) {
    this.suspendAfterMs = suspendAfterMs;
  }

  noteActivity(): void {
    this.announced = false;
    this.armTimer();
  }

  stop(): void {
    if (this.timer === null) {
      return;
    }

    clearTimeout(this.timer);
    this.timer = null;
  }

  private armTimer(): void {
    this.stop();
    this.timer = setTimeout(() => {
      this.printIdleBanner();
    }, this.suspendAfterMs);
    this.timer.unref();
  }

  private printIdleBanner(): void {
    if (this.announced) {
      return;
    }

    this.announced = true;
    console.log('');
    console.log(`${ANSI_RED}────────────────────────────────────────${ANSI_RESET}`);
    console.log(`${ANSI_RED}  ✗  Neon database → IDLE (suspended)${ANSI_RESET}`);
    console.log(
      `${ANSI_DIM}  No queries for ${Math.round(this.suspendAfterMs / 60_000)} min — compute scaled to zero${ANSI_RESET}`,
    );
    console.log(`${ANSI_RED}────────────────────────────────────────${ANSI_RESET}`);
    console.log('');
  }
}
