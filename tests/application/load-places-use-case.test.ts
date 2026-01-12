import { describe, expect, it, vi } from "vitest";
import { LoadPlacesUseCase } from "@/application";
import type { PlaceRepository } from "@/domain";

const fakePlaces = [
  { plz: "8001", placeName: "Zurich", e: 2680000, n: 1248000 },
];

describe("LoadPlacesUseCase", () => {
  it("returns places from the repository", async () => {
    const repository: PlaceRepository = {
      getPlaces: vi.fn().mockResolvedValue(fakePlaces),
    };

    const useCase = new LoadPlacesUseCase(repository);
    const result = await useCase.execute();

    expect(result).toEqual(fakePlaces);
    expect(repository.getPlaces).toHaveBeenCalledTimes(1);
  });
});
