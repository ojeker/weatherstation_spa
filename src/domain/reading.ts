import { InvalidValueError } from "./errors";
import { Timestamp } from "./timestamp";

export type ReadingKind = "ten-minute" | "hourly";

export const TEMPERATURE_RANGE_C = {
  min: -50,
  max: 60,
} as const;

export const WIND_DIRECTION_RANGE_DEG = {
  min: 0,
  max: 360,
} as const;

const MAX_SUNSHINE_MINUTES: Record<ReadingKind, number> = {
  "ten-minute": 10,
  hourly: 60,
};

/** A single weather measurement with temperature, sunshine, precipitation, wind, and pressure data. */
export class Reading {
  private constructor(
    readonly timestamp: Timestamp,
    readonly temperatureC: number,
    readonly sunshineMinutes: number | null,
    readonly precipitationMm: number | null,
    readonly windSpeedKmh: number | null,
    readonly windDirectionDeg: number | null,
    readonly pressureHpa: number | null,
    readonly kind: ReadingKind,
  ) {}

  static create(params: {
    timestamp: Timestamp;
    temperatureC: number;
    sunshineMinutes: number | null;
    precipitationMm: number | null;
    windSpeedKmh: number | null;
    windDirectionDeg: number | null;
    pressureHpa: number | null;
    kind: ReadingKind;
  }): Reading {
    if (!(params.timestamp instanceof Timestamp)) {
      throw new InvalidValueError("Reading timestamp is required.");
    }

    if (!Number.isFinite(params.temperatureC)) {
      throw new InvalidValueError("Temperature must be a finite number.");
    }

    if (
      params.temperatureC < TEMPERATURE_RANGE_C.min ||
      params.temperatureC > TEMPERATURE_RANGE_C.max
    ) {
      throw new InvalidValueError(
        `Temperature must be between ${TEMPERATURE_RANGE_C.min} and ${TEMPERATURE_RANGE_C.max} °C.`,
      );
    }

    const sunshineLimit = MAX_SUNSHINE_MINUTES[params.kind];
    const sunshineMinutes = params.sunshineMinutes;
    if (sunshineMinutes !== null) {
      if (!Number.isFinite(sunshineMinutes) || sunshineMinutes < 0) {
        throw new InvalidValueError(
          "Sunshine duration must be a non-negative number or null.",
        );
      }
      if (sunshineMinutes > sunshineLimit) {
        throw new InvalidValueError(
          `Sunshine duration cannot exceed ${sunshineLimit} minutes for ${params.kind} readings.`,
        );
      }
    }

    const precipitationMm = params.precipitationMm;
    if (precipitationMm !== null) {
      if (!Number.isFinite(precipitationMm) || precipitationMm < 0) {
        throw new InvalidValueError(
          "Precipitation must be a non-negative number or null.",
        );
      }
    }

    const windSpeedKmh = params.windSpeedKmh;
    if (windSpeedKmh !== null) {
      if (!Number.isFinite(windSpeedKmh) || windSpeedKmh < 0) {
        throw new InvalidValueError(
          "Wind speed must be a non-negative number or null.",
        );
      }
    }

    const windDirectionDeg = params.windDirectionDeg;
    if (windDirectionDeg !== null) {
      if (!Number.isFinite(windDirectionDeg)) {
        throw new InvalidValueError(
          "Wind direction must be a finite number or null.",
        );
      }
      if (
        windDirectionDeg < WIND_DIRECTION_RANGE_DEG.min ||
        windDirectionDeg > WIND_DIRECTION_RANGE_DEG.max
      ) {
        throw new InvalidValueError(
          `Wind direction must be between ${WIND_DIRECTION_RANGE_DEG.min} and ${WIND_DIRECTION_RANGE_DEG.max} degrees.`,
        );
      }
    }

    const pressureHpa = params.pressureHpa;
    if (pressureHpa !== null) {
      if (!Number.isFinite(pressureHpa) || pressureHpa <= 0) {
        throw new InvalidValueError(
          "Pressure must be a positive number or null.",
        );
      }
    }

    return new Reading(
      params.timestamp,
      params.temperatureC,
      sunshineMinutes,
      precipitationMm,
      windSpeedKmh,
      windDirectionDeg,
      pressureHpa,
      params.kind,
    );
  }
}
