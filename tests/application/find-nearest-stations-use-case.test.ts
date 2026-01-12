import { describe, expect, it, vi } from "vitest";
import { FindNearestStationsUseCase } from "@/application";
import type { Place, StationMetaRepository } from "@/domain";

const place: Place = { plz: "0000", placeName: "Origin", e: 0, n: 0 };

describe("FindNearestStationsUseCase", () => {
  it("computes distances and sorts by distance then name", async () => {
    const stations = [
      { abbreviation: "BRV", name: "Bravo", heightM: 500, e: 0, n: 10000 },
      { abbreviation: "ALP", name: "Alpha", heightM: 500, e: 0, n: 10000 },
      { abbreviation: "CHR", name: "Charlie", heightM: 500, e: 3000, n: 4000 },
    ];

    const repository: StationMetaRepository = {
      getStations: vi.fn().mockResolvedValue(stations),
    };

    const useCase = new FindNearestStationsUseCase(repository);
    const result = await useCase.execute(place);

    expect(result).toHaveLength(3);
    expect(result[0].station.name).toBe("Charlie");
    expect(result[0].distanceKm).toBeCloseTo(5);
    expect(result[1].station.name).toBe("Alpha");
    expect(result[2].station.name).toBe("Bravo");
  });

  it("returns only the nearest 10 stations", async () => {
    const stations = Array.from({ length: 12 }, (_, index) => ({
      abbreviation: `S${index + 1}`,
      name: `Station ${index + 1}`,
      heightM: 500,
      e: 0,
      n: index * 1000,
    }));

    const repository: StationMetaRepository = {
      getStations: vi.fn().mockResolvedValue(stations),
    };

    const useCase = new FindNearestStationsUseCase(repository);
    const result = await useCase.execute(place);

    expect(result).toHaveLength(10);
    expect(result[0].distanceKm).toBe(0);
  });
});
