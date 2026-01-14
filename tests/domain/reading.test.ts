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
      windSpeedKmh: 15.5,
      windDirectionDeg: 180,
      pressureHpa: 1013.25,
      kind: "hourly",
    });

    expect(reading.temperatureC).toBe(12.3);
    expect(reading.sunshineMinutes).toBe(45);
    expect(reading.precipitationMm).toBe(0.2);
    expect(reading.windSpeedKmh).toBe(15.5);
    expect(reading.windDirectionDeg).toBe(180);
    expect(reading.pressureHpa).toBe(1013.25);
  });

  it("accepts null for optional parameters", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    const reading = Reading.create({
      timestamp,
      temperatureC: null,
      sunshineMinutes: null,
      precipitationMm: null,
      windSpeedKmh: null,
      windDirectionDeg: null,
      pressureHpa: null,
      kind: "hourly",
    });

    expect(reading.temperatureC).toBeNull();
    expect(reading.windSpeedKmh).toBeNull();
    expect(reading.windDirectionDeg).toBeNull();
    expect(reading.pressureHpa).toBeNull();
  });

  it("rejects out-of-range temperature", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 100,
        sunshineMinutes: null,
        precipitationMm: null,
        windSpeedKmh: null,
        windDirectionDeg: null,
        pressureHpa: null,
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
        windSpeedKmh: null,
        windDirectionDeg: null,
        pressureHpa: null,
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
        windSpeedKmh: null,
        windDirectionDeg: null,
        pressureHpa: null,
        kind: "ten-minute",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rejects negative wind speed", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 10,
        sunshineMinutes: null,
        precipitationMm: null,
        windSpeedKmh: -5,
        windDirectionDeg: null,
        pressureHpa: null,
        kind: "hourly",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rejects wind direction outside 0-360 range", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 10,
        sunshineMinutes: null,
        precipitationMm: null,
        windSpeedKmh: null,
        windDirectionDeg: 400,
        pressureHpa: null,
        kind: "hourly",
      }),
    ).toThrow(InvalidValueError);
  });

  it("rejects non-positive pressure", () => {
    const timestamp = Timestamp.fromString("11.01.2026 13:20");

    expect(() =>
      Reading.create({
        timestamp,
        temperatureC: 10,
        sunshineMinutes: null,
        precipitationMm: null,
        windSpeedKmh: null,
        windDirectionDeg: null,
        pressureHpa: 0,
        kind: "hourly",
      }),
    ).toThrow(InvalidValueError);
  });
});
