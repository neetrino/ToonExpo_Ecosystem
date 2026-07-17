import { cookies } from 'next/headers';

import { loadWebEnv } from '@/lib/env';

import { adminReportNameSchema, type AdminReportName } from './constants';

export { adminReportNameSchema };

/** Proxies CSV generation to the guarded NestJS admin endpoint. */
export async function buildAdminReportCsv(report: AdminReportName): Promise<string> {
  const env = loadWebEnv();
  const configuredUrl = env.API_URL ?? env.NEXT_PUBLIC_API_URL;
  const baseUrl = (
    configuredUrl.startsWith('/')
      ? `${env.APP_URL.replace(/\/$/, '')}${configuredUrl}`
      : configuredUrl
  ).replace(/\/$/, '');
  const cookieStore = await cookies();
  const response = await fetch(`${baseUrl}/admin/reports/${report}`, {
    headers: { Cookie: cookieStore.toString(), Accept: 'text/csv' },
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error(`Admin report API failed with status ${response.status}`);
  }
  return response.text();
}
