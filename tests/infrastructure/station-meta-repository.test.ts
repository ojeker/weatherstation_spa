import { beforeEach, describe, expect, it, vi } from "vitest";
import { SchemaMismatchError } from "@/domain";
import { MeteoSwissStationMetaRepository } from "@/infrastructure";
import { fetchArrayBuffer } from "@/infrastructure/http-client";

vi.mock("@/infrastructure/http-client", () => ({
  fetchArrayBuffer: vi.fn(),
}));

const mockedFetchArrayBuffer = vi.mocked(fetchArrayBuffer);

describe("MeteoSwissStationMetaRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and maps station metadata", async () => {
    const csv = `station_abbr;station_name;station_height_masl;station_coordinates_lv95_east;station_coordinates_lv95_north
ALP;Alpha;450;2680000;1248000`;

    mockedFetchArrayBuffer.mockResolvedValue(
      new TextEncoder().encode(csv).buffer
    );

    const repository = new MeteoSwissStationMetaRepository();
    const stations = await repository.getStations();

    expect(stations).toHaveLength(1);
    expect(stations[0]).toEqual({
      abbreviation: "ALP",
      name: "Alpha",
      heightM: 450,
      e: 2680000,
      n: 1248000,
    });
  });

  it("throws SchemaMismatchError when required columns are missing", async () => {
    const csv = `station_abbr;station_name;station_height_masl
ALP;Alpha;450`;

    mockedFetchArrayBuffer.mockResolvedValue(
      new TextEncoder().encode(csv).buffer
    );

    const repository = new MeteoSwissStationMetaRepository();

    await expect(repository.getStations()).rejects.toThrow(SchemaMismatchError);
  });

  it("uses the MeteoSwiss station metadata URL", async () => {
    const csv = `station_abbr;station_name;station_height_masl;station_coordinates_lv95_east;station_coordinates_lv95_north
ALP;Alpha;450;2680000;1248000`;

    mockedFetchArrayBuffer.mockResolvedValue(
      new TextEncoder().encode(csv).buffer
    );

    const repository = new MeteoSwissStationMetaRepository();
    await repository.getStations();

    expect(mockedFetchArrayBuffer).toHaveBeenCalledWith(
      expect.stringContaining("ogd-smn_meta_stations.csv")
    );
  });
});
