import type { Reading } from "./reading";

/** Aggregate containing current reading and hourly series for today. */
export interface TodayWeather {
  /** Latest 10-minute reading for today, or null if unavailable. */
  current: Reading | null;
  /** Hourly readings for today, sorted by timestamp ascending. */
  hourly: Reading[];
}
