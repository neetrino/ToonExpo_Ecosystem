#!/usr/bin/env node
/**
 * Prints how to start API + Web in separate terminals (no turbo TUI).
 */
const lines = [
  '',
  'ToonExpo local dev — run in SEPARATE terminals (do not use turbo TUI):',
  '',
  '  1) API  →  pnpm run dev:api',
  '  2) Web  →  pnpm run dev:web',
  '',
  'First-time / after clone:',
  '  pnpm install',
  '  pnpm run build:database',
  '  pnpm --filter @toonexpo/contracts build',
  '  pnpm --filter @toonexpo/shared build',
  '',
  'Tips: FORCE_COLOR=1 in IDE terminals; API :4000, Web :3000.',
  '',
];

process.stdout.write(lines.join('\n'));
