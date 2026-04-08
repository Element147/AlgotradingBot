const encodeCsvValue = (value: string | number | boolean | null | undefined): string =>
  `"${String(value ?? '').replaceAll('"', '""')}"`;

export const buildCsv = (
  headers: string[],
  rows: Array<Array<string | number | boolean | null | undefined>>
): string =>
  [headers.map(encodeCsvValue).join(','), ...rows.map((row) => row.map(encodeCsvValue).join(','))].join(
    '\n'
  );

export const downloadCsvFile = (content: string, fileName: string): void => {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
