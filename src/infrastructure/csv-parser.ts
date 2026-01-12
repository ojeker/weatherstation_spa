import { CsvParseError } from "@/domain";

export interface CsvRow {
  [key: string]: string;
}

/** Parses semicolon-delimited CSV content into an array of row objects. */
export function parseCsv(content: string): CsvRow[] {
  const lines = content.trim().split(/\r?\n/);

  if (lines.length === 0) {
    throw new CsvParseError("CSV content is empty.");
  }

  const headerLine = lines[0];
  const headers = headerLine.split(";").map((h, index) => {
    const trimmed = h.trim();
    if (index === 0) {
      return trimmed.replace(/^\uFEFF/, "");
    }
    return trimmed;
  });

  if (headers.length === 0 || headers.every((h) => h === "")) {
    throw new CsvParseError("CSV header row is empty.");
  }

  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line === "") continue;

    const values = line.split(";");
    const row: CsvRow = {};

    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = values[j]?.trim() ?? "";
    }

    rows.push(row);
  }

  return rows;
}
