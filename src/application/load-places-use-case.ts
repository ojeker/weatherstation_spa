import type { Place, PlaceRepository } from "@/domain";

/** Use case for loading available places. */
export class LoadPlacesUseCase {
  constructor(private readonly placeRepository: PlaceRepository) {}

  async execute(): Promise<Place[]> {
    return this.placeRepository.getPlaces();
  }
}
