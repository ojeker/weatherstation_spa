import type { Reading, ReadingKind } from "@/domain";

const SPARK_BLOCKS = ["▁", "▂", "▃", "▄", "▅", "▆", "▇", "█"];

export interface SparkData {
  bars: string;
  summary: string;
}

/** Converts a value to a spark bar character based on min/max range. */
function valueToBlock(value: number, min: number, max: number): string {
  if (max === min) return SPARK_BLOCKS[4]; // middle block if no range
  const normalized = (value - min) / (max - min);
  const index = Math.min(
    SPARK_BLOCKS.length - 1,
    Math.max(0, Math.floor(normalized * SPARK_BLOCKS.length))
  );
  return SPARK_BLOCKS[index];
}

/** Gets the last N hourly readings, most recent last. */
export function getLastNReadings(readings: readonly Reading[], n: number): Reading[] {
  return readings.slice(-n);
}

/** Generates spark bars for temperature values. */
export function generateTempSpark(readings: readonly Reading[]): SparkData {
  if (readings.length === 0) {
    return { bars: "", summary: "no data" };
  }

  const temps = readings.map((r) => r.temperatureC);
  const min = Math.min(...temps);
  const max = Math.max(...temps);

  const bars = temps.map((t) => valueToBlock(t, min, max)).join("");
  const summary = `${Math.round(min)}° → ${Math.round(max)}°`;

  return { bars, summary };
}

/** Generates spark bars for sunshine values (as percentage). */
export function generateSunshineSpark(
  readings: readonly Reading[],
  kind: ReadingKind = "hourly"
): SparkData {
  if (readings.length === 0) {
    return { bars: "", summary: "no data" };
  }

  const maxMinutes = kind === "hourly" ? 60 : 10;
  const percentages = readings.map((r) =>
    r.sunshineMinutes !== null ? (r.sunshineMinutes / maxMinutes) * 100 : 0
  );

  const min = Math.min(...percentages);
  const max = Math.max(...percentages);

  const bars = percentages.map((p) => valueToBlock(p, 0, 100)).join("");

  const avg = Math.round(percentages.reduce((a, b) => a + b, 0) / percentages.length);
  const summary = avg > 70 ? "sunny" : avg > 30 ? "partly" : "cloudy";

  return { bars, summary };
}

/** Generates spark bars for precipitation values. */
export function generatePrecipSpark(readings: readonly Reading[]): SparkData {
  if (readings.length === 0) {
    return { bars: "", summary: "no data" };
  }

  const precip = readings.map((r) => r.precipitationMm ?? 0);
  const total = precip.reduce((a, b) => a + b, 0);
  const max = Math.max(...precip, 0.1); // avoid division by zero

  const bars = precip.map((p) => valueToBlock(p, 0, max)).join("");
  const summary = total === 0 ? "dry" : `${total.toFixed(1)}mm`;

  return { bars, summary };
}

/** Formats sunshine minutes as percentage. */
export function formatSunshinePercent(
  minutes: number | null,
  kind: ReadingKind
): string {
  if (minutes === null) return "—";
  const max = kind === "hourly" ? 60 : 10;
  return `${Math.round((minutes / max) * 100)}%`;
}

/** Formats precipitation value. */
export function formatPrecipitation(mm: number | null): string {
  if (mm === null) return "—";
  if (mm === 0) return "0mm";
  return `${mm.toFixed(1)}mm`;
}

/** Formats distance in kilometers with variable precision. */
export function formatDistanceKm(distanceKm: number): string {
  if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  }
  return `${Math.round(distanceKm)} km`;
}

/** Formats temperature with degree symbol and one decimal place. */
export function formatTemperature(celsius: number): string {
  return `${celsius.toFixed(1)}°C`;
}

/** Formats wind speed in km/h. */
export function formatWindSpeed(kmh: number | null): string {
  if (kmh === null) return "—";
  return `${Math.round(kmh)} km/h`;
}

/** Converts wind direction degrees to cardinal direction. */
export function degreesToCardinal(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index];
}

/** Formats wind direction as cardinal direction with degrees. */
export function formatWindDirection(degrees: number | null): string {
  if (degrees === null) return "—";
  return `${degreesToCardinal(degrees)} (${Math.round(degrees)}°)`;
}

/** Formats pressure in hPa. */
export function formatPressure(hpa: number | null): string {
  if (hpa === null) return "—";
  return `${Math.round(hpa)} hPa`;
}

/** Formats a timestamp as HH:mm. */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString("de-CH", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}

/** Gets hour labels for spark bar axis. */
export function getHourLabels(readings: readonly Reading[]): string[] {
  return readings.map((r) =>
    r.timestamp.toDate().toLocaleTimeString("de-CH", {
      hour: "2-digit",
      timeZone: "Europe/Zurich",
    })
  );
}

/** Gets color based on wind speed thresholds. */
export function getWindSpeedColor(speedKmh: number): string {
  if (speedKmh < 30) return "#22c55e"; // green
  if (speedKmh < 50) return "#eab308"; // yellow
  if (speedKmh < 70) return "#f97316"; // orange
  return "#ef4444"; // red
}
