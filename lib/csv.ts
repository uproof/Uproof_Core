export function parseCsv(text: string): Array<Record<string, string>> {
  const normalized = String(text || '').replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
  if (!normalized) return [];

  const lines: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < normalized.length; index += 1) {
    const char = normalized[index];
    const next = normalized[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === '\n' && !inQuotes) {
      lines.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length === 0) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.trim());
  const rows: Array<Record<string, string>> = [];

  for (let index = 1; index < lines.length; index += 1) {
    const values = splitCsvLine(lines[index]);
    if (values.every((value) => !String(value || '').trim())) {
      continue;
    }

    const row: Record<string, string> = {};
    headers.forEach((header, headerIndex) => {
      row[header] = String(values[headerIndex] ?? '').trim();
    });
    rows.push(row);
  }

  return rows;
}

export function stringifyCsv(rows: Array<Array<string | number | null | undefined>>) {
  return rows.map((row) => row.map((value) => escapeCsvField(value)).join(','));
}

function escapeCsvField(value: string | number | null | undefined) {
  const text = String(value ?? '');
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const safeText = /^[=+\-@\t]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safeText.replace(/"/g, '""').replace(/\n/g, '\r\n')}"`;
}

function splitCsvLine(line: string) {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current);
  return values;
}
