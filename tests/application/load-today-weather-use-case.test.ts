import { describe, expect, it, vi } from "vitest";
import {
  Station,
  type StationProvider,
  type TodayWeather,
  type WeatherRepository,
} from "@/domain";
import { LoadTodayWeatherUseCase } from "@/application";

describe("LoadTodayWeatherUseCase", () => {
  const mockStation = Station.create({ abbreviation: "GOE" });

  const mockWeather: TodayWeather = {
    current: null,
    hourly: [],
  };

  it("gets station from provider and fetches weather", async () => {
    const mockStationProvider: StationProvider = {
      getStation: vi.fn().mockReturnValue(mockStation),
      setStation: vi.fn(),
      hasStoredStation: vi.fn(),
    };

    const mockWeatherRepository: WeatherRepository = {
      getTodayWeather: vi.fn().mockResolvedValue(mockWeather),
    };

    const useCase = new LoadTodayWeatherUseCase(
      mockStationProvider,
      mockWeatherRepository
    );

    const result = await useCase.execute();

    expect(mockStationProvider.getStation).toHaveBeenCalled();
    expect(mockWeatherRepository.getTodayWeather).toHaveBeenCalledWith(
      mockStation
    );
    expect(result).toBe(mockWeather);
  });

  it("propagates errors from weather repository", async () => {
    const mockStationProvider: StationProvider = {
      getStation: vi.fn().mockReturnValue(mockStation),
      setStation: vi.fn(),
      hasStoredStation: vi.fn(),
    };

    const mockWeatherRepository: WeatherRepository = {
      getTodayWeather: vi.fn().mockRejectedValue(new Error("Network error")),
    };

    const useCase = new LoadTodayWeatherUseCase(
      mockStationProvider,
      mockWeatherRepository
    );

    await expect(useCase.execute()).rejects.toThrow("Network error");
  });

  it("uses station from provider for each execution", async () => {
    const stations = [
      Station.create({ abbreviation: "GOE" }),
      Station.create({ abbreviation: "KLZ" }),
    ];

    let callCount = 0;
    const mockStationProvider: StationProvider = {
      getStation: vi.fn().mockImplementation(() => stations[callCount++]),
      setStation: vi.fn(),
      hasStoredStation: vi.fn(),
    };

    const mockWeatherRepository: WeatherRepository = {
      getTodayWeather: vi.fn().mockResolvedValue(mockWeather),
    };

    const useCase = new LoadTodayWeatherUseCase(
      mockStationProvider,
      mockWeatherRepository
    );

    await useCase.execute();
    await useCase.execute();

    expect(mockWeatherRepository.getTodayWeather).toHaveBeenNthCalledWith(
      1,
      stations[0]
    );
    expect(mockWeatherRepository.getTodayWeather).toHaveBeenNthCalledWith(
      2,
      stations[1]
    );
  });
});
