/** @typedef {'PASS' | 'FAIL' | 'SKIP' | 'PARTIAL'} ResultStatus */

/**
 * @typedef {{
 *   name: string;
 *   status: ResultStatus;
 *   detail?: string;
 * }} FlowResult
 */

/** @type {FlowResult[]} */
const results = [];

/**
 * @param {string} name
 * @param {() => Promise<string | void>} fn
 */
export async function runCheck(name, fn) {
  try {
    const note = await fn();
    const detail = typeof note === 'string' ? note : undefined;
    const status = detail?.startsWith('PARTIAL') ? 'PARTIAL' : 'PASS';
    results.push({ name, status, detail });
    console.log(`  ✓ ${status.padEnd(7)} ${name}${detail ? ` — ${detail}` : ''}`);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    results.push({ name, status: 'FAIL', detail });
    console.log(`  ✗ FAIL    ${name} — ${detail}`);
  }
}

/**
 * @param {string} name
 * @param {string} reason
 */
export function skipCheck(name, reason) {
  results.push({ name, status: 'SKIP', detail: reason });
  console.log(`  ○ SKIP    ${name} — ${reason}`);
}

export function printSummary() {
  console.log('\n========== E2E SMOKE SUMMARY ==========');
  const widths = { name: 48, status: 8 };
  console.log(`${'Flow'.padEnd(widths.name)} ${'Status'.padEnd(widths.status)} Detail`);
  console.log('-'.repeat(100));
  for (const r of results) {
    console.log(
      `${r.name.slice(0, widths.name).padEnd(widths.name)} ${r.status.padEnd(widths.status)} ${r.detail ?? ''}`,
    );
  }
  const fail = results.filter((r) => r.status === 'FAIL').length;
  const pass = results.filter((r) => r.status === 'PASS' || r.status === 'PARTIAL').length;
  const skip = results.filter((r) => r.status === 'SKIP').length;
  console.log('-'.repeat(100));
  console.log(`PASS/PARTIAL: ${pass}  FAIL: ${fail}  SKIP: ${skip}`);
  return fail === 0;
}

export function getResults() {
  return results;
}

/**
 * @param {boolean} condition
 * @param {string} message
 */
export function assert(condition, message) {
  if (!condition) throw new Error(message);
}
