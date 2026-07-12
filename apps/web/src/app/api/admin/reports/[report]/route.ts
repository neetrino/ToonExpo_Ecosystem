import { NextResponse } from 'next/server';

import { assertAdminSession } from '@/lib/admin/assert-admin-session';
import { adminReportNameSchema, buildAdminReportCsv } from '@/lib/admin/reports/build-report';

type RouteContext = {
  params: Promise<{ report: string }>;
};

function unauthorizedJson(): NextResponse {
  return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
}

function notFoundJson(): NextResponse {
  return NextResponse.json({ error: 'not_found' }, { status: 404 });
}

/**
 * Admin CSV export. Must call assertAdminSession — route handlers bypass the
 * (admin) layout guard. Unauthorized callers get JSON 401 (never a CSV redirect).
 */
export async function GET(_request: Request, context: RouteContext): Promise<NextResponse> {
  const session = await assertAdminSession();
  if (!session) {
    return unauthorizedJson();
  }

  const { report: rawReport } = await context.params;
  const parsed = adminReportNameSchema.safeParse(rawReport);
  if (!parsed.success) {
    return notFoundJson();
  }

  const csv = await buildAdminReportCsv(parsed.data);
  const filename = `toonexpo-${parsed.data}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
