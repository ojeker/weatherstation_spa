import { InvalidValueError } from "./errors";
import { Timestamp } from "./timestamp";

export type ReadingKind = "ten-minute" | "hourly";

export const TEMPERATURE_RANGE_C = {
  min: -50,
  max: 60,
} as const;

const MAX_SUNSHINE_MINUTES: Record<ReadingKind, number> = {
  "ten-minute": 10,
  hourly: 60,
};

export class Reading {
  private constructor(
    readonly timestamp: Timestamp,
    readonly temperatureC: number,
    readonly sunshineMinutes: number | null,
    readonly precipitationMm: number | null,
    readonly kind: ReadingKind,
  ) {}

  static create(params: {
    timestamp: Timestamp;
    temperatureC: number;
    sunshineMinutes: number | null;
    precipitationMm: number | null;
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

    return new Reading(
      params.timestamp,
      params.temperatureC,
      sunshineMinutes,
      precipitationMm,
      params.kind,
    );
  }
}
