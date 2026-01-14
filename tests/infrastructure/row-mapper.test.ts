import { describe, expect, it } from "vitest";
import { InvalidValueError } from "@/domain";
import {
  parseNumericValue,
  mapCurrentReading,
  mapHourlyReading,
} from "@/infrastructure";

describe("parseNumericValue", () => {
  it("parses valid numeric string", () => {
    expect(parseNumericValue("12.3", "field")).toBe(12.3);
  });

  it("parses negative numbers", () => {
    expect(parseNumericValue("-5.5", "field")).toBe(-5.5);
  });

  it("parses integers", () => {
    expect(parseNumericValue("42", "field")).toBe(42);
  });

  it("returns null for empty string", () => {
    expect(parseNumericValue("", "field")).toBeNull();
  });

  it("returns null for whitespace-only string", () => {
    expect(parseNumericValue("   ", "field")).toBeNull();
  });

  it("returns null for undefined", () => {
    expect(parseNumericValue(undefined, "field")).toBeNull();
  });

  it("throws InvalidValueError for non-numeric string", () => {
    expect(() => parseNumericValue("abc", "field")).toThrow(InvalidValueError);
  });

  it("throws InvalidValueError for NaN", () => {
    expect(() => parseNumericValue("NaN", "field")).toThrow(InvalidValueError);
  });

  it("throws InvalidValueError for Infinity", () => {
    expect(() => parseNumericValue("Infinity", "field")).toThrow(
      InvalidValueError
    );
  });

  it("includes field name in error message", () => {
    expect(() => parseNumericValue("abc", "temperature")).toThrow(
      /temperature/
    );
  });
});

describe("mapCurrentReading", () => {
  it("maps valid row to Reading", () => {
    const row = {
      reference_timestamp: "11.01.2026 13:20",
      tre200s0: "12.3",
      sre000z0: "8",
      rre150z0: "0.5",
      fkl010z0: "5.0",
      dkl010z0: "180",
      pp0qnhs0: "1013.25",
    };

    const reading = mapCurrentReading(row);

    expect(reading.temperatureC).toBe(12.3);
    expect(reading.sunshineMinutes).toBe(8);
    expect(reading.precipitationMm).toBe(0.5);
    expect(reading.windSpeedKmh).toBe(18); // 5 m/s * 3.6
    expect(reading.windDirectionDeg).toBe(180);
    expect(reading.pressureHpa).toBe(1013.25);
    expect(reading.kind).toBe("ten-minute");
  });

  it("handles null values for optional fields", () => {
    const row = {
      reference_timestamp: "11.01.2026 13:20",
      tre200s0: "12.3",
      sre000z0: "",
      rre150z0: "",
      fkl010z0: "",
      dkl010z0: "",
      pp0qnhs0: "",
    };

    const reading = mapCurrentReading(row);

    expect(reading.temperatureC).toBe(12.3);
    expect(reading.sunshineMinutes).toBeNull();
    expect(reading.precipitationMm).toBeNull();
    expect(reading.windSpeedKmh).toBeNull();
    expect(reading.windDirectionDeg).toBeNull();
    expect(reading.pressureHpa).toBeNull();
  });

  it("allows missing temperature", () => {
    const row = {
      reference_timestamp: "11.01.2026 13:20",
      tre200s0: "",
      sre000z0: "8",
      rre150z0: "0.5",
      fkl010z0: "",
      dkl010z0: "",
      pp0qnhs0: "",
    };

    const reading = mapCurrentReading(row);

    expect(reading.temperatureC).toBeNull();
  });
});

describe("mapHourlyReading", () => {
  it("maps valid row to Reading", () => {
    const row = {
      reference_timestamp: "11.01.2026 12:00",
      tre200h0: "11.5",
      sre000h0: "45",
      rre150h0: "1.2",
      fkl010h0: "3.0",
      dkl010h0: "270",
      pp0qnhh0: "1015.0",
    };

    const reading = mapHourlyReading(row);

    expect(reading.temperatureC).toBe(11.5);
    expect(reading.sunshineMinutes).toBe(45);
    expect(reading.precipitationMm).toBe(1.2);
    expect(reading.windSpeedKmh).toBeCloseTo(10.8); // 3 m/s * 3.6
    expect(reading.windDirectionDeg).toBe(270);
    expect(reading.pressureHpa).toBe(1015.0);
    expect(reading.kind).toBe("hourly");
  });

  it("handles null values for optional fields", () => {
    const row = {
      reference_timestamp: "11.01.2026 12:00",
      tre200h0: "11.5",
      sre000h0: "",
      rre150h0: "",
      fkl010h0: "",
      dkl010h0: "",
      pp0qnhh0: "",
    };

    const reading = mapHourlyReading(row);

    expect(reading.sunshineMinutes).toBeNull();
    expect(reading.precipitationMm).toBeNull();
    expect(reading.windSpeedKmh).toBeNull();
    expect(reading.windDirectionDeg).toBeNull();
    expect(reading.pressureHpa).toBeNull();
  });
});
