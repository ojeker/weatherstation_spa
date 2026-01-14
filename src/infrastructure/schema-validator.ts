import { SchemaMismatchError } from "@/domain";
import type { CsvRow } from "./csv-parser";

export const CURRENT_READING_COLUMNS = [
  "reference_timestamp",
] as const;

export const HOURLY_READING_COLUMNS = [
  "reference_timestamp",
] as const;

export const PLACE_COLUMNS = [
  "Ortschaftsname",
  "PLZ4",
  "E",
  "N",
] as const;

export const STATION_META_COLUMNS = [
  "station_abbr",
  "station_name",
  "station_height_masl",
  "station_coordinates_lv95_east",
  "station_coordinates_lv95_north",
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
