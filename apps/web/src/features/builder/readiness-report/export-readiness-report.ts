import type {
  ReadinessReport,
  ReportTaskStatus,
} from '@/features/builder/readiness-report/report-model';

const xmlEscape = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

const cell = (value: string): string =>
  `<Cell><Data ss:Type="String">${xmlEscape(value)}</Data></Cell>`;

/**
 * Downloads the visible report as an Excel 2003 XML workbook.
 */
export const downloadReadinessReport = (
  report: ReadinessReport,
  headers: readonly [string, string, string, string],
  statusLabel: (status: ReportTaskStatus) => string,
  filename: string,
): void => {
  const tasks = [...report.epics.flatMap((epic) => epic.tasks), ...report.unassigned];
  const header = headers.map((item) => cell(item)).join('');
  const body = tasks
    .map((task) => {
      const order = task.sequence === null ? '' : String(task.sequence);
      return `<Row>${cell(task.epicTitle ?? '')}${cell(task.title)}${cell(statusLabel(task.status))}${cell(order)}</Row>`;
    })
    .join('');
  const xml = `<?xml version="1.0"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Readiness"><Table><Row>${header}</Row>${body}</Table></Worksheet>
</Workbook>`;
  const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
