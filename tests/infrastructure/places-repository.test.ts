import { beforeEach, describe, expect, it, vi } from "vitest";
import { SchemaMismatchError } from "@/domain";
import { SwissTopoPlaceRepository } from "@/infrastructure";
import { fetchArrayBuffer } from "@/infrastructure/http-client";
import { unzipSync } from "fflate";

vi.mock("@/infrastructure/http-client", () => ({
  fetchArrayBuffer: vi.fn(),
}));

vi.mock("fflate", async () => {
  const actual = await vi.importActual<typeof import("fflate")>("fflate");
  return {
    ...actual,
    unzipSync: vi.fn(),
  };
});

const mockedFetchArrayBuffer = vi.mocked(fetchArrayBuffer);
const mockedUnzipSync = vi.mocked(unzipSync);

describe("SwissTopoPlaceRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads and maps places from the ZIP CSV", async () => {
    const csv = `\uFEFFOrtschaftsname;PLZ4;E;N\nZurich;8001;2680000;1248000`;
    mockedUnzipSync.mockReturnValue({
      "AMTOVZ_CSV_LV95/AMTOVZ_CSV_LV95.csv": new TextEncoder().encode(csv),
    });
    mockedFetchArrayBuffer.mockResolvedValue(new ArrayBuffer(8));

    const repository = new SwissTopoPlaceRepository();
    const places = await repository.getPlaces();

    expect(places).toHaveLength(1);
    expect(places[0]).toEqual({
      plz: "8001",
      placeName: "Zurich",
      e: 2680000,
      n: 1248000,
    });
  });

  it("throws SchemaMismatchError when required columns are missing", async () => {
    const csv = `\uFEFFOrtschaftsname;PLZ4;E
Zurich;8001;2680000`;
    mockedUnzipSync.mockReturnValue({
      "AMTOVZ_CSV_LV95/AMTOVZ_CSV_LV95.csv": new TextEncoder().encode(csv),
    });
    mockedFetchArrayBuffer.mockResolvedValue(new ArrayBuffer(8));

    const repository = new SwissTopoPlaceRepository();

    await expect(repository.getPlaces()).rejects.toThrow(SchemaMismatchError);
  });

  it("uses the swisstopo ZIP URL", async () => {
    const csv = `\uFEFFOrtschaftsname;PLZ4;E;N\nZurich;8001;2680000;1248000`;
    mockedUnzipSync.mockReturnValue({
      "AMTOVZ_CSV_LV95/AMTOVZ_CSV_LV95.csv": new TextEncoder().encode(csv),
    });
    mockedFetchArrayBuffer.mockResolvedValue(new ArrayBuffer(8));

    const repository = new SwissTopoPlaceRepository();
    await repository.getPlaces();

    expect(mockedFetchArrayBuffer).toHaveBeenCalledWith(
      expect.stringContaining("ortschaftenverzeichnis_plz_2056.csv.zip")
    );
  });
});
