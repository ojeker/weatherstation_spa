import type { Place } from "../place";

/** Port for loading the list of available places. */
export interface PlaceRepository {
  getPlaces(): Promise<Place[]>;
}
