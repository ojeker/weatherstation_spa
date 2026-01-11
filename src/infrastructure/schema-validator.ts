import { SchemaMismatchError } from "@/domain";
import type { CsvRow } from "./csv-parser";

export const CURRENT_READING_COLUMNS = [
  "reference_timestamp",
  "tre200s0",
  "sre000z0",
  "rre150z0",
] as const;

export const HOURLY_READING_COLUMNS = [
  "reference_timestamp",
  "tre200h0",
  "sre000h0",
  "rre150h0",
] as const;

/** Validates that all required columns exist in the CSV rows. */
export function validateRequiredColumns(
  rows: CsvRow[],
  requiredColumns: readonly string[]
): void {
  if (rows.length === 0) return;

  const firstRow = rows[0];
  const availableColumns = Object.keys(firstRow);

  const missingColumns = requiredColumns.filter(
    (col) => !availableColumns.includes(col)
  );

  if (missingColumns.length > 0) {
    throw new SchemaMismatchError(
      `Missing required columns: ${missingColumns.join(", ")}`
    );
  }
}

/** Validates that all rows have matching station abbreviation. */
export function validateStationAbbreviation(
  rows: CsvRow[],
  expectedAbbreviation: string
): void {
  for (const row of rows) {
    const stationAbbr = row["station_abbr"];
    if (stationAbbr === undefined) continue;

    if (stationAbbr.toUpperCase() !== expectedAbbreviation.toUpperCase()) {
      throw new SchemaMismatchError(
        `Station mismatch: expected "${expectedAbbreviation}", got "${stationAbbr}"`
      );
    }
  }
}
