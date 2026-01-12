import { describe, expect, it, vi, beforeEach } from "vitest";
import { Station } from "@/domain";
import { MeteoSwissWeatherRepository } from "@/infrastructure";
import {
  VALID_CURRENT_CSV,
  VALID_HOURLY_CSV,
  MISSING_COLUMN_CSV,
  WRONG_STATION_CSV,
} from "../fixtures/csv-fixtures";

// Mock the http-client module
vi.mock("@/infrastructure/http-client", () => ({
  fetchText: vi.fn(),
}));

import { fetchText } from "@/infrastructure/http-client";

const mockedFetchText = vi.mocked(fetchText);

describe("MeteoSwissWeatherRepository", () => {
  const station = Station.create({ token: "goe", abbreviation: "GOE" });
  const testNow = new Date("2026-01-11T14:00:00Z");

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("fetches and composes TodayWeather from both CSVs", async () => {
    mockedFetchText.mockImplementation((url: string) => {
      if (url.includes("_t_now")) return Promise.resolve(VALID_CURRENT_CSV);
      if (url.includes("_h_now")) return Promise.resolve(VALID_HOURLY_CSV);
      return Promise.reject(new Error("Unknown URL"));
    });

    const repository = new MeteoSwissWeatherRepository(testNow);
    const result = await repository.getTodayWeather(station);

    expect(result.current).not.toBeNull();
    expect(result.current?.temperatureC).toBe(12.3);
    expect(result.hourly).toHaveLength(3);
  });

  it("returns hourly readings sorted by timestamp ascending", async () => {
    mockedFetchText.mockImplementation((url: string) => {
      if (url.includes("_t_now")) return Promise.resolve(VALID_CURRENT_CSV);
      if (url.includes("_h_now")) return Promise.resolve(VALID_HOURLY_CSV);
      return Promise.reject(new Error("Unknown URL"));
    });

    const repository = new MeteoSwissWeatherRepository(testNow);
    const result = await repository.getTodayWeather(station);

    const timestamps = result.hourly.map((r) =>
      r.timestamp.toDate().getTime()
    );

    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThan(timestamps[i - 1]);
    }
  });

  it("selects latest current reading for today", async () => {
    mockedFetchText.mockImplementation((url: string) => {
      if (url.includes("_t_now")) return Promise.resolve(VALID_CURRENT_CSV);
      if (url.includes("_h_now")) return Promise.resolve(VALID_HOURLY_CSV);
      return Promise.reject(new Error("Unknown URL"));
    });

    const repository = new MeteoSwissWeatherRepository(testNow);
    const result = await repository.getTodayWeather(station);

    // CSV timestamp 13:20 is stored as UTC directly
    expect(result.current?.timestamp.toISOString()).toBe(
      "2026-01-11T13:20:00.000Z"
    );
  });

  it("throws SchemaMismatchError for missing columns", async () => {
    mockedFetchText.mockImplementation((url: string) => {
      if (url.includes("_t_now")) return Promise.resolve(MISSING_COLUMN_CSV);
      if (url.includes("_h_now")) return Promise.resolve(VALID_HOURLY_CSV);
      return Promise.reject(new Error("Unknown URL"));
    });

    const repository = new MeteoSwissWeatherRepository(testNow);

    await expect(repository.getTodayWeather(station)).rejects.toThrow(
      /Missing required columns/
    );
  });

  it("throws SchemaMismatchError for wrong station", async () => {
    mockedFetchText.mockImplementation((url: string) => {
      if (url.includes("_t_now")) return Promise.resolve(WRONG_STATION_CSV);
      if (url.includes("_h_now")) return Promise.resolve(VALID_HOURLY_CSV);
      return Promise.reject(new Error("Unknown URL"));
    });

    const repository = new MeteoSwissWeatherRepository(testNow);

    await expect(repository.getTodayWeather(station)).rejects.toThrow(
      /Station mismatch/
    );
  });

  it("returns null current when no readings for today", async () => {
    const oldDataCsv = `reference_timestamp;station_abbr;tre200s0;sre000z0;rre150z0;fkl010z0;dkl010z0;pp0qnhs0
01.01.2026 13:20;GOE;12.3;8;0.5;5.0;180;1013.25`;

    mockedFetchText.mockImplementation((url: string) => {
      if (url.includes("_t_now")) return Promise.resolve(oldDataCsv);
      if (url.includes("_h_now")) return Promise.resolve(VALID_HOURLY_CSV);
      return Promise.reject(new Error("Unknown URL"));
    });

    const repository = new MeteoSwissWeatherRepository(testNow);
    const result = await repository.getTodayWeather(station);

    expect(result.current).toBeNull();
  });

  it("constructs correct URLs with station token", async () => {
    mockedFetchText.mockImplementation(() =>
      Promise.resolve(VALID_CURRENT_CSV)
    );

    const repository = new MeteoSwissWeatherRepository(testNow);

    try {
      await repository.getTodayWeather(station);
    } catch {
      // Ignore errors, we just want to check the URLs
    }

    expect(mockedFetchText).toHaveBeenCalledWith(
      expect.stringContaining("/goe/ogd-smn_goe_t_now.csv")
    );
    expect(mockedFetchText).toHaveBeenCalledWith(
      expect.stringContaining("/goe/ogd-smn_goe_h_now.csv")
    );
  });
});
