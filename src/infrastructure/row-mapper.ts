import {
  InvalidValueError,
  Reading,
  type ReadingKind,
  Timestamp,
} from "@/domain";
import type { CsvRow } from "./csv-parser";

/** Parses a numeric value from CSV: empty string becomes null, invalid throws. */
export function parseNumericValue(
  value: string,
  fieldName: string
): number | null {
  const trimmed = value.trim();

  if (trimmed === "") {
    return null;
  }

  const parsed = Number(trimmed);

  if (!Number.isFinite(parsed)) {
    throw new InvalidValueError(
      `Invalid numeric value for ${fieldName}: "${value}"`
    );
  }

  return parsed;
}

/** Maps a CSV row from the 10-minute dataset to a Reading. */
export function mapCurrentReading(row: CsvRow): Reading {
  const timestamp = Timestamp.fromString(row["reference_timestamp"]);

  const temperatureC = parseNumericValue(row["tre200s0"], "tre200s0");
  if (temperatureC === null) {
    throw new InvalidValueError("Temperature (tre200s0) is required.");
  }

  const sunshineMinutes = parseNumericValue(row["sre000z0"], "sre000z0");
  const precipitationMm = parseNumericValue(row["rre150z0"], "rre150z0");

  return Reading.create({
    timestamp,
    temperatureC,
    sunshineMinutes,
    precipitationMm,
    kind: "ten-minute" as ReadingKind,
  });
}

/** Maps a CSV row from the hourly dataset to a Reading. */
export function mapHourlyReading(row: CsvRow): Reading {
  const timestamp = Timestamp.fromString(row["reference_timestamp"]);

  const temperatureC = parseNumericValue(row["tre200h0"], "tre200h0");
  if (temperatureC === null) {
    throw new InvalidValueError("Temperature (tre200h0) is required.");
  }

  const sunshineMinutes = parseNumericValue(row["sre000h0"], "sre000h0");
  const precipitationMm = parseNumericValue(row["rre150h0"], "rre150h0");

  return Reading.create({
    timestamp,
    temperatureC,
    sunshineMinutes,
    precipitationMm,
    kind: "hourly" as ReadingKind,
  });
}
