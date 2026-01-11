import { describe, expect, it } from "vitest";
import { InvalidValueError, Reading, Timestamp } from "../../src/domain";

describe("Reading", () => {
  it("creates a valid hourly reading", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    const reading = Reading.create({
      timestamp,
      temperatureC: 12.3,
      sunshineMinutes: 45,
      precipitationMm: 0.2,
      kind: "hourly",
    });

    expect(reading.temperatureC).toBe(12.3);
    expect(reading.sunshineMinutes).toBe(45);
    expect(reading.precipitationMm).toBe(0.2);
  });

  it("rejects out-of-range temperature", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 100,
        sunshineMinutes: null,
        precipitationMm: null,
        kind: "hourly",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rejects negative precipitation", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 5,
        sunshineMinutes: 5,
        precipitationMm: -1,
        kind: "ten-minute",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rejects sunshine minutes beyond range", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 5,
        sunshineMinutes: 20,
        precipitationMm: null,
        kind: "ten-minute",
      }),
    ).toThrow(InvalidValueError);
  });
});
