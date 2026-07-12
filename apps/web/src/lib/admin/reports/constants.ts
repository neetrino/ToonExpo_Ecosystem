import { z } from 'zod';

/** Max rows per admin CSV export (v1). Streaming is a follow-up. */
export const REPORT_ROW_LIMIT = 5000;

export const ADMIN_REPORT_NAMES = ['deals', 'checkins', 'project-views', 'audit'] as const;

export type AdminReportName = (typeof ADMIN_REPORT_NAMES)[number];

export const adminReportNameSchema = z.enum(ADMIN_REPORT_NAMES);

/** UTF-8 BOM so Excel opens CSV with correct encoding. */
export const CSV_UTF8_BOM = '\uFEFF';
