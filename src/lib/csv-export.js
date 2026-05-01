/**
 * Generate a CSV string from column definitions and row data.
 *
 * @param {{ header: string, key: string }[]} columns
 * @param {Record<string, any>[]} rows
 * @returns {string}
 */
export function generateCSV(columns, rows) {
  const escape = (value) => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerLine = columns.map((col) => escape(col.header)).join(',');
  const dataLines = rows.map((row) =>
    columns.map((col) => escape(row[col.key])).join(',')
  );

  return [headerLine, ...dataLines].join('\n');
}

/**
 * Trigger a CSV file download in the browser.
 *
 * @param {string} csv - CSV string content
 * @param {string} filename - Download filename
 */
export function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
