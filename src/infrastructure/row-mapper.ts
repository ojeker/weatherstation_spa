import { InvalidValueError, Reading, type ReadingKind, Timestamp } from "@/domain";
import type { CsvRow } from "./csv-parser";

/** Parses a numeric value from CSV: empty string becomes null, invalid throws. */
export function parseNumericValue(
  value: string | undefined,
  fieldName: string
): number | null {
  if (value === undefined) {
    return null;
  }

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

/** Converts wind speed from m/s to km/h. */
function msToKmh(ms: number | null): number | null {
  return ms !== null ? ms * 3.6 : null;
}

/** Maps a CSV row from the 10-minute dataset to a Reading. */
export function mapCurrentReading(row: CsvRow): Reading {
  const timestamp = Timestamp.fromString(row["reference_timestamp"]);

  const temperatureC = parseNumericValue(row["tre200s0"], "tre200s0");

  const sunshineMinutes = parseNumericValue(row["sre000z0"], "sre000z0");
  const precipitationMm = parseNumericValue(row["rre150z0"], "rre150z0");
  const windSpeedMs = parseNumericValue(row["fkl010z0"], "fkl010z0");
  const windDirectionDeg = parseNumericValue(row["dkl010z0"], "dkl010z0");
  const pressureHpa = parseNumericValue(row["pp0qnhs0"], "pp0qnhs0");

  return Reading.create({
    timestamp,
    temperatureC,
    sunshineMinutes,
    precipitationMm,
    windSpeedKmh: msToKmh(windSpeedMs),
    windDirectionDeg,
    pressureHpa,
    kind: "ten-minute" as ReadingKind,
  });
}

/** Maps a CSV row from the hourly dataset to a Reading. */
export function mapHourlyReading(row: CsvRow): Reading {
  const timestamp = Timestamp.fromString(row["reference_timestamp"]);

  const temperatureC = parseNumericValue(row["tre200h0"], "tre200h0");

  const sunshineMinutes = parseNumericValue(row["sre000h0"], "sre000h0");
  const precipitationMm = parseNumericValue(row["rre150h0"], "rre150h0");
  const windSpeedMs = parseNumericValue(row["fkl010h0"], "fkl010h0");
  const windDirectionDeg = parseNumericValue(row["dkl010h0"], "dkl010h0");
  const pressureHpa = parseNumericValue(row["pp0qnhh0"], "pp0qnhh0");

  return Reading.create({
    timestamp,
    temperatureC,
    sunshineMinutes,
    precipitationMm,
    windSpeedKmh: msToKmh(windSpeedMs),
    windDirectionDeg,
    pressureHpa,
    kind: "hourly" as ReadingKind,
  });
}
